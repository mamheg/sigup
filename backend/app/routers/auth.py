"""Auth API (U3): registration with email code, login, logout, me, password reset."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app import schemas
from app.auth import (
    bearer_scheme,
    create_session,
    delete_session,
    delete_user_sessions,
    get_current_user,
    hash_password,
    normalize_email,
    sanitize_string,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.email_service import (
    consume_codes,
    create_code,
    get_verified_record,
    is_verified,
    send_code_email,
    verify_code,
)
from app.models import EmailVerification, PasswordReset, User, UserCredential, UserRole

router = APIRouter(prefix="/auth", tags=["auth"])

MIN_PASSWORD_LENGTH = 6


def _validated_email(raw: Optional[str]) -> str:
    email = normalize_email(sanitize_string(raw, max_len=255) or "")
    if "@" not in email or "." not in email or len(email) < 5:
        raise HTTPException(status_code=400, detail="Некорректный email-адрес")
    return email


def _send_code_or_fail(db: Session, email: str, model, purpose: str) -> schemas.MessageResponse:
    code = create_code(db, email, model)
    sent = send_code_email(email, code, purpose=purpose)
    if sent:
        return schemas.MessageResponse(message="Код отправлен на вашу почту")
    if settings.DEBUG:
        # brunch-style dev fallback: expose the code when SMTP fails, DEBUG only
        return schemas.MessageResponse(message=f"Код: {code} (ошибка отправки email, DEBUG)")
    raise HTTPException(status_code=502, detail="Не удалось отправить письмо. Попробуйте позже.")


def _check_password(password: str) -> str:
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Пароль должен содержать минимум {MIN_PASSWORD_LENGTH} символов",
        )
    return password


# ─── Registration: email verification ───

@router.post("/send-code", response_model=schemas.MessageResponse)
def send_verification_code(data: schemas.SendCodeRequest, db: Session = Depends(get_db)):
    email = _validated_email(data.email)
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Пользователь с таким email уже зарегистрирован")
    return _send_code_or_fail(db, email, EmailVerification, "Подтверждение email")


@router.post("/verify-code", response_model=schemas.MessageResponse)
def verify_verification_code(data: schemas.VerifyCodeRequest, db: Session = Depends(get_db)):
    email = _validated_email(data.email)
    code = sanitize_string(data.code, max_len=8) or ""
    if not verify_code(db, email, code, EmailVerification):
        raise HTTPException(status_code=400, detail="Неверный или устаревший код")
    return schemas.MessageResponse(message="Email подтверждён")


@router.post("/register", response_model=schemas.AuthResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email = _validated_email(data.email)
    name = sanitize_string(data.name, max_len=120) or ""
    if not name:
        raise HTTPException(status_code=400, detail="Укажите имя")
    _check_password(data.password)

    if not is_verified(db, email, EmailVerification):
        raise HTTPException(
            status_code=403, detail="Email не подтверждён. Запросите код и введите его."
        )

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Пользователь с таким email уже зарегистрирован")

    user = User(
        name=name,
        email=email,
        phone=sanitize_string(data.phone, max_len=40),
        role=UserRole.entrepreneur,
        city=sanitize_string(data.city, max_len=120),
        country=sanitize_string(data.country, max_len=120),
    )
    db.add(user)
    db.flush()
    db.add(UserCredential(user_id=user.id, password_hash=hash_password(data.password)))
    db.commit()
    db.refresh(user)

    consume_codes(db, email, EmailVerification)
    token = create_session(db, user.id)
    return schemas.AuthResponse(token=token, user=schemas.UserOut.model_validate(user))


# ─── Login / logout / me ───

@router.post("/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    email = normalize_email(sanitize_string(data.email, max_len=255) or "")
    user = db.query(User).filter(User.email == email).first()
    credential = (
        db.query(UserCredential).filter(UserCredential.user_id == user.id).first() if user else None
    )
    if not user or not credential or not verify_password(data.password, credential.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    token = create_session(db, user.id)
    return schemas.AuthResponse(token=token, user=schemas.UserOut.model_validate(user))


@router.post("/logout", response_model=schemas.MessageResponse)
def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    delete_session(db, credentials.credentials)
    return schemas.MessageResponse(message="Вы вышли из аккаунта")


@router.get("/me", response_model=schemas.UserOut)
def me(user: User = Depends(get_current_user)):
    return user


# ─── Password reset ───

@router.post("/password-reset/send-code", response_model=schemas.MessageResponse)
def password_reset_send_code(data: schemas.SendCodeRequest, db: Session = Depends(get_db)):
    email = _validated_email(data.email)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")
    return _send_code_or_fail(db, email, PasswordReset, "Восстановление пароля")


@router.post("/password-reset/verify", response_model=schemas.MessageResponse)
def password_reset_verify(data: schemas.VerifyCodeRequest, db: Session = Depends(get_db)):
    email = _validated_email(data.email)
    code = sanitize_string(data.code, max_len=8) or ""
    if not verify_code(db, email, code, PasswordReset):
        raise HTTPException(status_code=400, detail="Неверный или устаревший код")
    return schemas.MessageResponse(message="Код подтверждён")


@router.post("/password-reset/confirm", response_model=schemas.MessageResponse)
def password_reset_confirm(data: schemas.PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    email = _validated_email(data.email)
    code = sanitize_string(data.code, max_len=8) or ""
    _check_password(data.new_password)

    record = get_verified_record(db, email, code, PasswordReset)
    if not record:
        raise HTTPException(status_code=400, detail="Неверный или устаревший код")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")

    credential = db.query(UserCredential).filter(UserCredential.user_id == user.id).first()
    if credential:
        credential.password_hash = hash_password(data.new_password)
    else:
        db.add(UserCredential(user_id=user.id, password_hash=hash_password(data.new_password)))
    db.commit()

    # New password invalidates all existing sessions
    delete_user_sessions(db, user.id)
    consume_codes(db, email, PasswordReset)
    return schemas.MessageResponse(message="Пароль обновлён. Войдите с новым паролем.")

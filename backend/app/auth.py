"""Password hashing (bcrypt), opaque sessions, and auth dependencies."""
import datetime
import secrets
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AuthSession, User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

bearer_scheme = HTTPBearer(auto_error=False)


# ─── Helpers ───

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    except ValueError:
        return False


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def sanitize_string(value: Optional[str], max_len: int = 500) -> Optional[str]:
    """Trim, cap length, and strip control characters (brunchcoffee pattern)."""
    if value is None:
        return None
    value = value.strip()
    if len(value) > max_len:
        value = value[:max_len]
    value = value.replace("\x00", "").replace("\r", " ").replace("\n", " ")
    return value


# ─── Sessions ───

def create_session(db: Session, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=settings.SESSION_TTL_DAYS)
    db.add(AuthSession(token=token, user_id=user_id, expires_at=expires_at))
    db.commit()
    return token


def purge_expired_sessions(db: Session) -> None:
    """Lazily delete expired sessions (called on every authenticated request)."""
    db.query(AuthSession).filter(
        AuthSession.expires_at < datetime.datetime.utcnow()
    ).delete(synchronize_session=False)
    db.commit()


def delete_session(db: Session, token: str) -> None:
    db.query(AuthSession).filter(AuthSession.token == token).delete(synchronize_session=False)
    db.commit()


def delete_user_sessions(db: Session, user_id: int) -> None:
    db.query(AuthSession).filter(AuthSession.user_id == user_id).delete(synchronize_session=False)
    db.commit()


# ─── Dependencies ───

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    purge_expired_sessions(db)

    session = db.query(AuthSession).filter(AuthSession.token == credentials.credentials).first()
    if session is None:
        raise HTTPException(status_code=401, detail="Недействительный или истёкший токен")

    user = db.query(User).filter(User.id == session.user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Недействительный или истёкший токен")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return user

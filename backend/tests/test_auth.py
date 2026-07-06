"""U3 auth API tests: registration with email code, login, logout, me, password reset."""
import datetime

import app.main as main_module
from app.config import settings
from app.models import AuthSession, EmailVerification, PasswordReset

EMAIL = "user@example.com"
PASSWORD = "secret123"


def get_code(db, email, model=EmailVerification):
    row = db.query(model).filter(model.email == email).order_by(model.id.desc()).first()
    assert row is not None, f"no code stored for {email}"
    return row.code


def register_user(client, db, email=EMAIL, password=PASSWORD, name="Тестовый Пользователь"):
    resp = client.post("/api/auth/send-code", json={"email": email})
    assert resp.status_code == 200, resp.text
    code = get_code(db, email.strip().lower())
    resp = client.post("/api/auth/verify-code", json={"email": email, "code": code})
    assert resp.status_code == 200, resp.text
    return client.post(
        "/api/auth/register", json={"email": email, "password": password, "name": name}
    )


# ─── Health (U1) ───

def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "db": "connected"}


# ─── Registration flow (§18.2) ───

def test_register_login_me_flow(client, db_session):
    resp = register_user(client, db_session)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["token"]
    assert body["user"]["email"] == EMAIL
    assert body["user"]["role"] == "entrepreneur"

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['token']}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == EMAIL
    assert resp.json()["role"] == "entrepreneur"

    resp = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert resp.status_code == 200
    assert resp.json()["token"]


def test_register_without_verify_403(client):
    resp = client.post(
        "/api/auth/register", json={"email": EMAIL, "password": PASSWORD, "name": "Имя"}
    )
    assert resp.status_code == 403


def test_register_duplicate_email_409(client, db_session):
    assert register_user(client, db_session).status_code == 200
    # second registration for the same email (different case) — one account
    resp = client.post("/api/auth/send-code", json={"email": EMAIL.upper()})
    assert resp.status_code == 409

    # even with a verified code the register endpoint refuses duplicates
    db_session.add(EmailVerification(email=EMAIL, code="123456", verified=True))
    db_session.commit()
    resp = client.post(
        "/api/auth/register", json={"email": EMAIL.upper(), "password": PASSWORD, "name": "Имя"}
    )
    assert resp.status_code == 409


def test_register_short_password_400(client, db_session):
    resp = register_user(client, db_session, password="123")
    assert resp.status_code == 400


def test_register_invalid_email_400(client):
    resp = client.post("/api/auth/send-code", json={"email": "not-an-email"})
    assert resp.status_code == 400


# ─── Codes ───

def test_verify_wrong_code_400(client, db_session):
    client.post("/api/auth/send-code", json={"email": EMAIL})
    resp = client.post("/api/auth/verify-code", json={"email": EMAIL, "code": "000000"})
    assert resp.status_code == 400


def test_code_reuse_400(client, db_session):
    client.post("/api/auth/send-code", json={"email": EMAIL})
    code = get_code(db_session, EMAIL)
    assert client.post("/api/auth/verify-code", json={"email": EMAIL, "code": code}).status_code == 200
    resp = client.post("/api/auth/verify-code", json={"email": EMAIL, "code": code})
    assert resp.status_code == 400


def test_expired_code_400(client, db_session):
    client.post("/api/auth/send-code", json={"email": EMAIL})
    row = db_session.query(EmailVerification).filter(EmailVerification.email == EMAIL).first()
    row.created_at = datetime.datetime.utcnow() - datetime.timedelta(minutes=16)
    db_session.commit()
    resp = client.post("/api/auth/verify-code", json={"email": EMAIL, "code": row.code})
    assert resp.status_code == 400


def test_send_code_smtp_failure_non_debug_502(client, monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", False)
    resp = client.post("/api/auth/send-code", json={"email": EMAIL})
    assert resp.status_code == 502


def test_send_code_smtp_failure_debug_returns_code(client, db_session):
    # settings.DEBUG=true from .env: failed SMTP send returns the code in the message
    resp = client.post("/api/auth/send-code", json={"email": EMAIL})
    assert resp.status_code == 200
    assert get_code(db_session, EMAIL) in resp.json()["message"]


# ─── Login / tokens ───

def test_login_wrong_password_401(client, db_session):
    register_user(client, db_session)
    resp = client.post("/api/auth/login", json={"email": EMAIL, "password": "wrong-pass"})
    assert resp.status_code == 401


def test_login_unknown_email_401(client):
    resp = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": PASSWORD})
    assert resp.status_code == 401


def test_me_without_token_401(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_bad_token_401(client):
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer garbage-token"})
    assert resp.status_code == 401


def test_me_expired_token_401_and_purged(client, db_session):
    token = register_user(client, db_session).json()["token"]
    session = db_session.query(AuthSession).filter(AuthSession.token == token).first()
    session.expires_at = datetime.datetime.utcnow() - datetime.timedelta(seconds=1)
    db_session.commit()

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
    # expired row lazily purged
    assert db_session.query(AuthSession).filter(AuthSession.token == token).first() is None


def test_email_case_insensitive_single_account(client, db_session):
    resp = register_user(client, db_session, email="MiXeD@Example.COM")
    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == "mixed@example.com"

    resp = client.post(
        "/api/auth/login", json={"email": "mixed@EXAMPLE.com", "password": PASSWORD}
    )
    assert resp.status_code == 200


def test_logout_invalidates_token(client, db_session):
    token = register_user(client, db_session).json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/me", headers=headers).status_code == 200

    assert client.post("/api/auth/logout", headers=headers).status_code == 200
    assert client.get("/api/auth/me", headers=headers).status_code == 401


# ─── Password reset ───

def test_password_reset_flow(client, db_session):
    old_token = register_user(client, db_session).json()["token"]

    resp = client.post("/api/auth/password-reset/send-code", json={"email": EMAIL})
    assert resp.status_code == 200
    code = get_code(db_session, EMAIL, model=PasswordReset)

    resp = client.post("/api/auth/password-reset/verify", json={"email": EMAIL, "code": code})
    assert resp.status_code == 200

    resp = client.post(
        "/api/auth/password-reset/confirm",
        json={"email": EMAIL, "code": code, "new_password": "brand-new-pass"},
    )
    assert resp.status_code == 200

    # all existing sessions invalidated
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {old_token}"})
    assert resp.status_code == 401

    # old password no longer works, new one does
    assert client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD}).status_code == 401
    assert (
        client.post("/api/auth/login", json={"email": EMAIL, "password": "brand-new-pass"}).status_code
        == 200
    )


def test_password_reset_unknown_email_404(client):
    resp = client.post("/api/auth/password-reset/send-code", json={"email": "ghost@example.com"})
    assert resp.status_code == 404


def test_password_reset_confirm_without_verify_400(client, db_session):
    register_user(client, db_session)
    client.post("/api/auth/password-reset/send-code", json={"email": EMAIL})
    code = get_code(db_session, EMAIL, model=PasswordReset)
    # skip the verify step
    resp = client.post(
        "/api/auth/password-reset/confirm",
        json={"email": EMAIL, "code": code, "new_password": "brand-new-pass"},
    )
    assert resp.status_code == 400


# ─── Rate limiter (U1) ───

def test_rate_limit_429(client, monkeypatch):
    monkeypatch.setattr(main_module, "RATE_LIMIT_MAX_REQUESTS", 5)
    for _ in range(5):
        assert client.get("/api/health").status_code == 200
    resp = client.get("/api/health")
    assert resp.status_code == 429

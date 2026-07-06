"""SMTP sending of 6-digit codes (adapted from brunchcoffee/backend/email_service.py).

Codes: 6 digits, TTL 15 minutes. Works for both email verification (registration)
and password reset — the caller passes the model class (EmailVerification / PasswordReset).
"""
import random
import smtplib
import ssl
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.config import settings

CODE_TTL_MINUTES = 15


def generate_code() -> str:
    """Generate a 6-digit numeric code."""
    return str(random.randint(100000, 999999))


def send_code_email(to_email: str, code: str, purpose: str = "Подтверждение email") -> bool:
    """Send a code via email. Returns True if sent successfully."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP credentials not configured. Code for {to_email}: {code}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{purpose} — SiGup"
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
        msg["To"] = to_email

        # Plain text version (helps spam filters)
        text = f"""SiGup — {purpose}

Ваш код: {code}

Введите этот код на сайте SiGup.
Код действителен {CODE_TTL_MINUTES} минут.

Если вы не запрашивали этот код, проигнорируйте это письмо.

SiGup — платформа проектов и мастеров
"""

        html = f"""
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{purpose} — SiGup</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f0e8;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 32px 16px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 440px; width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e2d4;">
                            <tr>
                                <td style="background: #1d3a2f; padding: 32px 24px; text-align: center;">
                                    <h1 style="margin: 0; color: #f7f3ea; font-size: 24px; font-weight: 700; letter-spacing: -0.3px;">SiGup</h1>
                                    <p style="margin: 8px 0 0; color: rgba(247, 243, 234, 0.75); font-size: 14px;">{purpose}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 36px 28px 28px; text-align: center;">
                                    <p style="margin: 0 0 24px; color: #4c5548; font-size: 15px; line-height: 1.6;">
                                        Для продолжения введите код ниже:
                                    </p>
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: separate;">
                                        <tr>
                                            <td style="background: #f7f3ea; border-radius: 16px; padding: 28px 44px; text-align: center; border: 2px solid #e0d8c4;">
                                                <p style="margin: 0 0 10px; color: #7c806f; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Ваш код</p>
                                                <p style="margin: 0; color: #1d3a2f; font-size: 38px; font-weight: 800; letter-spacing: 12px; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">{code}</p>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 24px 0 0; color: #7c806f; font-size: 14px; line-height: 1.5;">
                                        Код действителен <strong style="color: #1d3a2f;">{CODE_TTL_MINUTES} минут</strong>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0 28px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                                        <tr><td style="border-top: 1px solid #ece6d8;"></td></tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 24px 28px 32px; text-align: center;">
                                    <p style="margin: 0 0 8px; color: #9aa08c; font-size: 13px; line-height: 1.5;">
                                        Если вы не запрашивали этот код, просто проигнорируйте письмо.
                                    </p>
                                    <p style="margin: 0; color: #b9bfa9; font-size: 12px;">SiGup — платформа проектов и мастеров</p>
                                </td>
                            </tr>
                        </table>
                        <p style="margin: 16px 0 0; color: #9aa08c; font-size: 12px; text-align: center;">
                            Не видите письмо? Проверьте папку <strong style="color: #7c806f;">Спам</strong>.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls(context=context)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM or settings.SMTP_USER, to_email, msg.as_string())

        return True
    except Exception as exc:
        print(f"Failed to send email: {exc}")
        return False


def create_code(db: Session, email: str, model) -> str:
    """Create and store a new code (replacing older ones for this email). Returns the code."""
    code = generate_code()
    db.query(model).filter(model.email == email).delete(synchronize_session=False)
    db.add(model(email=email, code=code))
    db.commit()
    return code


def verify_code(db: Session, email: str, code: str, model) -> bool:
    """Check code validity (exists, unused, not older than 15 min); marks it verified."""
    record = (
        db.query(model)
        .filter(model.email == email, model.code == code, model.verified == False)  # noqa: E712
        .first()
    )
    if not record:
        return False

    if datetime.utcnow() > record.created_at + timedelta(minutes=CODE_TTL_MINUTES):
        return False

    record.verified = True
    db.commit()
    return True


def is_verified(db: Session, email: str, model) -> bool:
    """Check whether the email has a verified code record."""
    record = (
        db.query(model)
        .filter(model.email == email, model.verified == True)  # noqa: E712
        .first()
    )
    return record is not None


def get_verified_record(db: Session, email: str, code: str, model):
    """Return the verified record matching email+code (for reset confirm), or None."""
    return (
        db.query(model)
        .filter(model.email == email, model.code == code, model.verified == True)  # noqa: E712
        .first()
    )


def consume_codes(db: Session, email: str, model) -> None:
    """Delete all code records for an email (after successful use)."""
    db.query(model).filter(model.email == email).delete(synchronize_session=False)
    db.commit()

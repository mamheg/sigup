"""Application settings loaded from environment / .env (pydantic-settings)."""
import os
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ directory (parent of app/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    # Database: when unset (or unreachable) database.py falls back to local SQLite dev.db
    DATABASE_URL: Optional[str] = None

    # SMTP for verification / password-reset codes
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # Admin account created by seed.py
    ADMIN_EMAIL: str = "admin@sigup.ru"
    ADMIN_PASSWORD: str = "change-me"

    # Uploads directory, relative to backend/ (absolute paths are respected)
    UPLOAD_DIR: str = "static/uploads"

    # Comma-separated list of allowed CORS origins
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Public site base URL — used for absolute <loc> links in sitemap.xml
    SITE_URL: str = "https://sigup-blond.vercel.app"

    # Auth session lifetime in days
    SESSION_TTL_DAYS: int = 30

    # In DEBUG mode failed SMTP sends return the code in the response message
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def upload_dir_abs(self) -> str:
        if os.path.isabs(self.UPLOAD_DIR):
            return self.UPLOAD_DIR
        return os.path.join(BASE_DIR, self.UPLOAD_DIR)


settings = Settings()

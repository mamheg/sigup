"""Database engine: PostgreSQL via DATABASE_URL with SQLite fallback (brunchcoffee pattern)."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import BASE_DIR, settings

SQLITE_PATH = os.path.join(BASE_DIR, "dev.db")
SQLITE_URL = f"sqlite:///{SQLITE_PATH}"

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Handle Heroku-style URL format for SQLAlchemy (postgres:// -> postgresql://)
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    try:
        engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
        with engine.connect():
            pass
        print("[OK] Connected to PostgreSQL")
    except Exception as exc:  # pragma: no cover - depends on environment
        print(f"[WARN] PostgreSQL unavailable ({exc}), using SQLite for local development")
        SQLALCHEMY_DATABASE_URL = SQLITE_URL
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    print("[WARN] DATABASE_URL not set, using SQLite for local development")
    SQLALCHEMY_DATABASE_URL = SQLITE_URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

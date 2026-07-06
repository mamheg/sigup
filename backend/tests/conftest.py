import datetime
import secrets

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401 — register models on Base.metadata
from app.database import Base, get_db
from app.main import _rate_limit_store, app
from app.models import (
    AuthSession,
    Card,
    CardStatus,
    Category,
    Event,
    EventStatus,
    User,
    UserRole,
)
from app.services.slugs import make_slug, slugify

# Temp SQLite (in-memory, shared across connections via StaticPool)
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    _rate_limit_store.clear()
    yield
    _rate_limit_store.clear()


@pytest.fixture(autouse=True)
def _no_smtp(monkeypatch):
    """Never send real emails in tests; simulate SMTP failure (DEBUG fallback path)."""
    monkeypatch.setattr("app.routers.auth.send_code_email", lambda *args, **kwargs: False)


# ─── Factories for card/upload tests (U4/U5) ───

@pytest.fixture()
def make_user(db_session):
    """Create a user with an active session; returns (user, bearer_token)."""

    def _make(email="owner@example.com", name="Аскер Тестовый", role=UserRole.entrepreneur):
        user = User(name=name, email=email, role=role)
        db_session.add(user)
        db_session.flush()
        token = secrets.token_urlsafe(32)
        db_session.add(
            AuthSession(
                token=token,
                user_id=user.id,
                expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=30),
            )
        )
        db_session.commit()
        return user, token

    return _make


@pytest.fixture()
def make_category(db_session):
    def _make(name="Продукты", sort_order=0):
        slug = slugify(name)
        existing = db_session.query(Category).filter(Category.slug == slug).first()
        if existing:
            return existing
        category = Category(name=name, slug=slug, sort_order=sort_order)
        db_session.add(category)
        db_session.commit()
        return category

    return _make


@pytest.fixture()
def make_event(db_session):
    def _make(title="Тестовое событие", status=EventStatus.published, **fields):
        event = Event(title=title, status=status, **fields)
        db_session.add(event)
        db_session.commit()
        return event

    return _make


@pytest.fixture()
def make_card(db_session):
    def _make(owner, category, name="Тестовая карточка", status=CardStatus.published, **fields):
        fields.setdefault("short_description", "Короткое описание для теста.")
        card = Card(
            name=name,
            category_id=category.id,
            status=status,
            owner_id=owner.id,
            **fields,
        )
        db_session.add(card)
        db_session.flush()
        card.slug = make_slug(card.name, card.id)
        db_session.commit()
        return card

    return _make

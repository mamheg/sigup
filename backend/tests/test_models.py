"""U2 tests: schema/migration, seed idempotency, enums, slugs."""
import os

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, create_engine
from sqlalchemy.exc import IntegrityError, StatementError

from app import seed
from app.models import (
    Card,
    CardPhoto,
    CardProduct,
    CardStatus,
    Category,
    Event,
    User,
    UserRole,
)

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXPECTED_TABLES = {
    "users",
    "user_credentials",
    "auth_sessions",
    "email_verifications",
    "password_resets",
    "categories",
    "cards",
    "card_photos",
    "card_products",
    "events",
    "moderation_events",
}


def _make_user(db, email="owner@example.com", role=UserRole.entrepreneur):
    user = User(name="Владелец", email=email, role=role)
    db.add(user)
    db.flush()
    return user


def _make_category(db, name="Продукты"):
    category = Category(name=name, slug="produkty", sort_order=0)
    db.add(category)
    db.flush()
    return category


# ─── Migration ───

def test_migration_0001_on_clean_db(tmp_path):
    db_path = tmp_path / "migrate.db"
    cfg = Config(os.path.join(BACKEND_DIR, "alembic.ini"))
    cfg.set_main_option("script_location", os.path.join(BACKEND_DIR, "alembic"))
    cfg.set_main_option("sqlalchemy.url", f"sqlite:///{db_path}")

    command.upgrade(cfg, "head")

    engine = create_engine(f"sqlite:///{db_path}")
    tables = set(inspect(engine).get_table_names())
    assert EXPECTED_TABLES.issubset(tables), f"missing: {EXPECTED_TABLES - tables}"
    engine.dispose()


# ─── Seed ───

def test_seed_idempotent(db_session):
    first = seed.run(db_session)
    assert first["users"] == 2  # admin + seed entrepreneur
    assert first["categories"] == 10
    assert first["cards"] == 10
    assert first["events"] == 5

    counts_after_first = (
        db_session.query(User).count(),
        db_session.query(Category).count(),
        db_session.query(Card).count(),
        db_session.query(CardPhoto).count(),
        db_session.query(CardProduct).count(),
        db_session.query(Event).count(),
    )

    second = seed.run(db_session)
    assert all(v == 0 for v in second.values()), f"second seed created objects: {second}"

    counts_after_second = (
        db_session.query(User).count(),
        db_session.query(Category).count(),
        db_session.query(Card).count(),
        db_session.query(CardPhoto).count(),
        db_session.query(CardProduct).count(),
        db_session.query(Event).count(),
    )
    assert counts_after_first == counts_after_second


def test_seed_content(db_session):
    seed.run(db_session)

    admin = db_session.query(User).filter(User.role == UserRole.admin).one()
    assert admin.email  # from env settings

    card = db_session.query(Card).filter(Card.name == "Сырная мастерская «Уздых»").one()
    assert card.status == CardStatus.published
    assert card.is_featured is True
    assert card.slug == f"syrnaya-masterskaya-uzdyh-{card.id}"
    assert len(card.photos) == 5
    assert card.photos[0].url.startswith("https://images.unsplash.com/")
    assert len(card.products) == 4

    pending = db_session.query(Card).filter(Card.status == CardStatus.pending).count()
    assert pending == 2  # этно-тур + резные изделия


# ─── Model constraints ───

def test_card_without_optional_fields_valid(db_session):
    user = _make_user(db_session)
    category = _make_category(db_session)
    card = Card(name="Минимальная карточка", category_id=category.id, owner_id=user.id)
    db_session.add(card)
    db_session.commit()

    assert card.status == CardStatus.draft
    assert card.whatsapp is None and card.website is None and card.lat is None


def test_enum_rejects_unknown_status(db_session):
    user = _make_user(db_session)
    category = _make_category(db_session)
    card = Card(name="Карточка", category_id=category.id, owner_id=user.id, status="weird")
    db_session.add(card)
    with pytest.raises((StatementError, LookupError)):
        db_session.flush()
    db_session.rollback()


def test_users_email_unique(db_session):
    _make_user(db_session, email="dup@example.com")
    db_session.commit()
    db_session.add(User(name="Второй", email="dup@example.com"))
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


# ─── Slugs ───

def test_make_slug_transliteration():
    from app.services.slugs import extract_id, make_slug, slugify

    assert make_slug("Сырная мастерская «Уздых»", 12) == "syrnaya-masterskaya-uzdyh-12"
    assert extract_id("syrnaya-masterskaya-uzdyh-12") == 12
    assert extract_id("no-id-here") is None
    assert slugify("Соль и традиционные товары") == "sol-i-traditsionnye-tovary"
    assert slugify("ZEPHYR Parfum") == "zephyr-parfum"

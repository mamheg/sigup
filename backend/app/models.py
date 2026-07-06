"""SQLAlchemy models per the plan ER diagram.

Enums use native_enum=False + validate_strings=True so that the same schema
works on both PostgreSQL and the SQLite used in tests (plan risk note).
"""
import datetime
import enum

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow() -> datetime.datetime:
    return datetime.datetime.utcnow()


class UserRole(str, enum.Enum):
    entrepreneur = "entrepreneur"
    admin = "admin"


class CardStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    published = "published"
    rejected = "rejected"
    needs_revision = "needs_revision"
    hidden = "hidden"


class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    hidden = "hidden"
    finished = "finished"


class EventType(str, enum.Enum):
    # UI labels: event = "Мероприятие", promo = "Акция", happening = "Событие"
    event = "event"
    promo = "promo"
    happening = "happening"


def status_enum(enum_cls, name: str):
    return SAEnum(enum_cls, name=name, native_enum=False, validate_strings=True, length=20)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)  # stored lowercase
    phone = Column(String(40), nullable=True)
    role = Column(status_enum(UserRole, "user_role"), nullable=False, default=UserRole.entrepreneur)
    city = Column(String(120), nullable=True)
    country = Column(String(120), nullable=True)
    created_at = Column(DateTime, nullable=False, default=utcnow)

    credential = relationship(
        "UserCredential", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    sessions = relationship("AuthSession", back_populates="user", cascade="all, delete-orphan")
    cards = relationship("Card", back_populates="owner")


class UserCredential(Base):
    __tablename__ = "user_credentials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)  # passlib bcrypt (salt embedded)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="credential")


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    token = Column(String(64), primary_key=True)  # opaque secrets.token_urlsafe(32)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    expires_at = Column(DateTime, nullable=False, index=True)

    user = relationship("User", back_populates="sessions")


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(8), nullable=False)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    verified = Column(Boolean, nullable=False, default=False)


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(8), nullable=False)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    verified = Column(Boolean, nullable=False, default=False)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    slug = Column(String(140), unique=True, nullable=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0)

    cards = relationship("Card", back_populates="category")


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(200), unique=True, nullable=True, index=True)  # transliterated name + "-{id}"
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    short_description = Column(String(300), nullable=True)
    full_description = Column(Text, nullable=True)
    country = Column(String(120), nullable=True)
    city = Column(String(120), nullable=True)
    address = Column(String(300), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    instagram = Column(String(120), nullable=True)
    phone = Column(String(40), nullable=True)
    whatsapp = Column(String(40), nullable=True)
    telegram = Column(String(120), nullable=True)
    website = Column(String(255), nullable=True)
    price_info = Column(String(500), nullable=True)
    delivery_info = Column(String(500), nullable=True)
    status = Column(status_enum(CardStatus, "card_status"), nullable=False, default=CardStatus.draft, index=True)
    admin_comment = Column(Text, nullable=True)
    is_featured = Column(Boolean, nullable=False, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="cards")
    category = relationship("Category", back_populates="cards")
    photos = relationship(
        "CardPhoto", back_populates="card", cascade="all, delete-orphan", order_by="CardPhoto.sort_order"
    )
    products = relationship(
        "CardProduct", back_populates="card", cascade="all, delete-orphan", order_by="CardProduct.sort_order"
    )
    moderation_events = relationship(
        "ModerationEvent", back_populates="card", cascade="all, delete-orphan"
    )


class CardPhoto(Base):
    __tablename__ = "card_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, index=True)
    url = Column(String(500), nullable=False)  # /static/... or external URL (seed data)
    thumb_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    card = relationship("Card", back_populates="photos")


class CardProduct(Base):
    __tablename__ = "card_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    price = Column(String(120), nullable=True)  # free-form text, per TZ §7 ("по запросу", "1 200 ₽")
    description = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    card = relationship("Card", back_populates="products")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    type = Column(status_enum(EventType, "event_type"), nullable=False, default=EventType.event)
    image_url = Column(String(500), nullable=True)
    date_start = Column(Date, nullable=True)  # ApiEvent contract allows null (sorted nulls-last)
    date_end = Column(Date, nullable=True)
    location = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    link = Column(String(500), nullable=True)
    status = Column(status_enum(EventStatus, "event_status"), nullable=False, default=EventStatus.draft)
    is_featured = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=utcnow)


class ModerationEvent(Base):
    __tablename__ = "moderation_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(30), nullable=False)  # approve / reject / needs_revision / hide / show / edit
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utcnow)

    card = relationship("Card", back_populates="moderation_events")
    admin = relationship("User")

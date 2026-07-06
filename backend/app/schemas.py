"""Pydantic schemas: auth (U3) + catalog/cabinet cards (U4/U5).

Card shapes mirror the frontend contract in src/lib/api.ts (ApiCard, ApiPhoto,
ApiProduct, ApiCategory, Paginated) — snake_case, English statuses.
"""
import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models import Card, CardStatus, UserRole


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    city: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class MessageResponse(BaseModel):
    success: bool = True
    message: str


class SendCodeRequest(BaseModel):
    email: str


class VerifyCodeRequest(BaseModel):
    email: str
    code: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class PasswordResetConfirmRequest(BaseModel):
    email: str
    code: str
    new_password: str


# ─── Cards: output shapes (= ApiCard / ApiPhoto / ApiProduct / ApiCategory) ───

class PhotoOut(BaseModel):
    id: int
    url: str
    thumb_url: Optional[str] = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductOut(BaseModel):
    id: int
    name: str
    price: str = ""  # free-form text; contract requires a string
    description: Optional[str] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("price", mode="before")
    @classmethod
    def _price_none_to_empty(cls, value):
        return value if value is not None else ""


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    sort_order: int
    cards_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CardOut(BaseModel):
    id: int
    slug: str
    name: str
    category_id: int
    category_name: Optional[str] = None
    short_description: str = ""
    full_description: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    instagram: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    telegram: Optional[str] = None
    website: Optional[str] = None
    price_info: Optional[str] = None
    delivery_info: Optional[str] = None
    status: CardStatus
    admin_comment: Optional[str] = None
    is_featured: bool
    owner_id: int
    owner_name: Optional[str] = None
    photos: list[PhotoOut] = []
    products: list[ProductOut] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("short_description", mode="before")
    @classmethod
    def _short_none_to_empty(cls, value):
        return value if value is not None else ""


def card_to_out(card: Card) -> CardOut:
    """Shared ApiCard serializer: ORM card + joined category/owner names."""
    out = CardOut.model_validate(card)
    out.category_name = card.category.name if card.category else None
    out.owner_name = card.owner.name if card.owner else None
    return out


class PaginatedCards(BaseModel):
    items: list[CardOut]
    total: int


# ─── Cards: input shapes (cabinet) ───

class ProductIn(BaseModel):
    name: str
    price: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class CardCreate(BaseModel):
    name: str
    category_id: int
    short_description: str
    full_description: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    instagram: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    telegram: Optional[str] = None
    website: Optional[str] = None
    price_info: Optional[str] = None
    delivery_info: Optional[str] = None
    products: Optional[list[ProductIn]] = None


class CardUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    instagram: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    telegram: Optional[str] = None
    website: Optional[str] = None
    price_info: Optional[str] = None
    delivery_info: Optional[str] = None
    products: Optional[list[ProductIn]] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

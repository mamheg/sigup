"""Pydantic schemas: auth (U3) + catalog/cabinet cards (U4/U5) + admin/events (U6/U7).

Card shapes mirror the frontend contract in src/lib/api.ts (ApiCard, ApiPhoto,
ApiProduct, ApiCategory, ApiEvent, AdminStats, ActivityItem, Paginated) —
snake_case, English statuses.
"""
import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models import Card, CardStatus, EventStatus, EventType, UserRole


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    city: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
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
    views_count: int = 0
    clicks_count: int = 0
    likes_count: int = 0
    liked: bool = False  # did the CURRENT user like this card (false for guests)
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("short_description", mode="before")
    @classmethod
    def _short_none_to_empty(cls, value):
        return value if value is not None else ""


def card_to_out(card: Card, current_user_id: Optional[int] = None) -> CardOut:
    """Shared ApiCard serializer: ORM card + joined category/owner names + metrics.

    `likes_count` = number of CardLike rows; `liked` = whether current_user_id is
    among the likers (always False when current_user_id is None, e.g. guests).
    """
    out = CardOut.model_validate(card)
    out.category_name = card.category.name if card.category else None
    out.owner_name = card.owner.name if card.owner else None
    likes = card.likes
    out.likes_count = len(likes)
    out.liked = current_user_id is not None and any(
        like.user_id == current_user_id for like in likes
    )
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
    avatar_url: Optional[str] = None


# ─── Metrics: click / like / upload / cabinet stats response shapes ───

class ClickCountOut(BaseModel):
    clicks_count: int


class LikeStateOut(BaseModel):
    likes_count: int
    liked: bool


class UploadUrlOut(BaseModel):
    url: str


class CabinetStatsOut(BaseModel):
    """= CabinetStats in api.ts: sums across the current entrepreneur's cards."""

    total_views: int
    total_clicks: int
    total_likes: int


# ─── Events (= ApiEvent) ───

class EventOut(BaseModel):
    id: int
    title: str
    type: EventType
    image_url: Optional[str] = None
    date_start: Optional[datetime.date] = None
    date_end: Optional[datetime.date] = None
    location: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    status: EventStatus
    is_featured: bool

    model_config = ConfigDict(from_attributes=True)


class EventCreate(BaseModel):
    title: str
    type: EventType = EventType.event
    image_url: Optional[str] = None
    date_start: Optional[datetime.date] = None
    date_end: Optional[datetime.date] = None
    location: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    status: EventStatus = EventStatus.draft
    is_featured: bool = False


class EventUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[EventType] = None
    image_url: Optional[str] = None
    date_start: Optional[datetime.date] = None
    date_end: Optional[datetime.date] = None
    location: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    status: Optional[EventStatus] = None
    is_featured: Optional[bool] = None


# ─── Admin (U6) ───

class ModerationCommentIn(BaseModel):
    """reject / needs-revision body: a non-empty comment is mandatory (§9)."""

    comment: str

    @field_validator("comment")
    @classmethod
    def _comment_required(cls, value: str) -> str:
        value = (value or "").replace("\x00", "").strip()
        if not value:
            raise ValueError("Комментарий обязателен")
        return value[:2000]


class AdminCardUpdate(CardUpdate):
    """Admin edit: same fields as the cabinet PATCH plus is_featured (KTD-10)."""

    is_featured: Optional[bool] = None


class AdminUserOut(UserOut):
    cards_count: int = 0


class AdminStatsOut(BaseModel):
    """= AdminStats in api.ts. Deltas are 7-day counts by created_at."""

    pending_cards: int
    published_cards: int
    entrepreneurs: int
    events: int
    total_views: int
    total_clicks: int
    total_likes: int
    pending_delta_7d: int
    published_delta_7d: int
    entrepreneurs_delta_7d: int
    events_delta_7d: int


class ActivityItemOut(BaseModel):
    """= ActivityItem in api.ts (merged admin dashboard feed)."""

    id: int
    kind: str
    text: str
    created_at: datetime.datetime


class CategoryCreate(BaseModel):
    name: str
    sort_order: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None

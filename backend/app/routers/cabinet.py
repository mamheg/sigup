"""Cabinet API (U4+U5): the entrepreneur's own cards, photos, and profile.

Status machine, entrepreneur side (KTD-3):
- POST /cards            -> draft
- POST /cards/{id}/submit: draft|needs_revision|rejected -> pending (else 409)
- PATCH /cards/{id}      : editing a published card sends it back to pending
                           (hidden from the public site until re-approved).
"""
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.auth import get_current_user, sanitize_string
from app.config import settings
from app.database import get_db
from app.models import (
    Card,
    CardPhoto,
    CardProduct,
    CardStatus,
    Category,
    User,
    UserRole,
    utcnow,
)
from app.services import images
from app.services.slugs import make_slug

router = APIRouter(prefix="/cabinet", tags=["cabinet"])

SUBMITTABLE_STATUSES = {CardStatus.draft, CardStatus.needs_revision, CardStatus.rejected}

# Simple string fields with their column length caps (single-line, sanitized)
_TEXT_FIELDS = {
    "country": 120,
    "city": 120,
    "address": 300,
    "instagram": 120,
    "phone": 40,
    "whatsapp": 40,
    "telegram": 120,
    "website": 255,
    "price_info": 500,
    "delivery_info": 500,
}


# ─── Helpers ───

def _clean_multiline(value: Optional[str], max_len: int = 20000) -> Optional[str]:
    """Trim/cap while preserving newlines (full_description keeps paragraphs)."""
    if value is None:
        return None
    value = value.replace("\x00", "").strip()
    return value[:max_len] or None


def _validate_name(raw: Optional[str]) -> str:
    name = sanitize_string(raw, max_len=200)
    if not name or len(name) < 2:
        raise HTTPException(status_code=400, detail="Название должно содержать минимум 2 символа")
    return name


def _validate_short_description(raw: Optional[str]) -> str:
    short = sanitize_string(raw, max_len=300)
    if not short or len(short) < 10:
        raise HTTPException(
            status_code=400, detail="Краткое описание должно содержать минимум 10 символов"
        )
    return short


def _validate_category(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=400, detail="Категория не найдена")
    return category


def _get_card(db: Session, card_id: int) -> Card:
    card = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail="Карточка не найдена")
    return card


def _owned_card(db: Session, card_id: int, user: User) -> Card:
    """Card editable by its owner only (admin edits go through /admin, U6)."""
    card = _get_card(db, card_id)
    if card.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Это не ваша карточка")
    return card


def _card_for_photos(db: Session, card_id: int, user: User) -> Card:
    """Photos may be managed by the owner or an admin (plan U4)."""
    card = _get_card(db, card_id)
    if card.owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Это не ваша карточка")
    return card


def _apply_optional_fields(card: Card, data) -> None:
    provided = data.model_dump(exclude_unset=True)
    if "full_description" in provided:
        card.full_description = _clean_multiline(provided["full_description"])
    for field, max_len in _TEXT_FIELDS.items():
        if field in provided:
            setattr(card, field, sanitize_string(provided[field], max_len=max_len) or None)
    for field in ("lat", "lng"):
        if field in provided:
            setattr(card, field, provided[field])


def _replace_products(card: Card, products: list[schemas.ProductIn]) -> None:
    """Nested products: replace-all semantics (delete-orphan cascade cleans old rows)."""
    card.products.clear()
    for order, item in enumerate(products):
        name = sanitize_string(item.name, max_len=200)
        if not name:
            raise HTTPException(status_code=400, detail="У товара должно быть название")
        card.products.append(
            CardProduct(
                name=name,
                price=sanitize_string(item.price, max_len=120) or None,
                description=sanitize_string(item.description, max_len=500) or None,
                image_url=sanitize_string(item.image_url, max_len=500) or None,
                sort_order=order,
            )
        )


# ─── My cards ───

@router.get("/cards", response_model=list[schemas.CardOut])
def my_cards(
    status: Optional[CardStatus] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Card)
        .options(
            joinedload(Card.category),
            joinedload(Card.owner),
            selectinload(Card.photos),
            selectinload(Card.products),
        )
        .filter(Card.owner_id == user.id)
    )
    if status is not None:
        query = query.filter(Card.status == status)
    cards = query.order_by(Card.updated_at.desc(), Card.id.desc()).all()
    return [schemas.card_to_out(c) for c in cards]


@router.post("/cards", response_model=schemas.CardOut, status_code=201)
def create_card(
    data: schemas.CardCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = Card(
        name=_validate_name(data.name),
        category_id=_validate_category(db, data.category_id).id,
        short_description=_validate_short_description(data.short_description),
        status=CardStatus.draft,
        owner_id=user.id,
    )
    _apply_optional_fields(card, data)
    db.add(card)
    db.flush()
    card.slug = make_slug(card.name, card.id)
    if data.products is not None:
        _replace_products(card, data.products)
    db.commit()
    db.refresh(card)
    return schemas.card_to_out(card)


@router.patch("/cards/{card_id}", response_model=schemas.CardOut)
def update_card(
    card_id: int,
    data: schemas.CardUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = _owned_card(db, card_id, user)
    provided = data.model_dump(exclude_unset=True)
    was_published = card.status == CardStatus.published

    if "name" in provided:
        card.name = _validate_name(provided["name"])
        card.slug = make_slug(card.name, card.id)  # slug follows renames
    if "category_id" in provided:
        card.category_id = _validate_category(db, provided["category_id"]).id
    if "short_description" in provided:
        card.short_description = _validate_short_description(provided["short_description"])
    _apply_optional_fields(card, data)
    if data.products is not None:
        _replace_products(card, data.products)

    if was_published:
        # KTD-3 binding rule: owner edit of a published card -> back to moderation
        card.status = CardStatus.pending
        card.admin_comment = None

    card.updated_at = utcnow()
    db.commit()
    db.refresh(card)
    return schemas.card_to_out(card)


@router.post("/cards/{card_id}/submit", response_model=schemas.CardOut)
def submit_card(
    card_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = _owned_card(db, card_id, user)
    if card.status not in SUBMITTABLE_STATUSES:
        raise HTTPException(
            status_code=409,
            detail=f"Карточку со статусом «{card.status.value}» нельзя отправить на проверку",
        )
    card.status = CardStatus.pending
    card.admin_comment = None
    card.updated_at = utcnow()
    db.commit()
    db.refresh(card)
    return schemas.card_to_out(card)


@router.delete("/cards/{card_id}", status_code=204)
def delete_card(
    card_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = _owned_card(db, card_id, user)
    images.delete_card_dir(card.id, settings.upload_dir_abs)
    db.delete(card)  # cascades to photos/products/moderation events
    db.commit()


# ─── Photos (U4) ───

@router.post("/cards/{card_id}/photos", response_model=schemas.PhotoOut, status_code=201)
async def upload_photo(
    card_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = _card_for_photos(db, card_id, user)

    count = db.query(func.count(CardPhoto.id)).filter(CardPhoto.card_id == card.id).scalar() or 0
    if count >= images.MAX_PHOTOS_PER_CARD:
        raise HTTPException(
            status_code=409,
            detail=f"Максимум {images.MAX_PHOTOS_PER_CARD} фотографий на карточку",
        )

    content = await file.read()
    images.validate_upload(content, file.content_type)
    url, thumb_url = images.process_and_save(content, card.id, settings.upload_dir_abs)

    max_order = (
        db.query(func.max(CardPhoto.sort_order)).filter(CardPhoto.card_id == card.id).scalar()
    )
    photo = CardPhoto(
        card_id=card.id,
        url=url,
        thumb_url=thumb_url,
        sort_order=0 if max_order is None else max_order + 1,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/cards/{card_id}/photos/{photo_id}", status_code=204)
def delete_photo(
    card_id: int,
    photo_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = _card_for_photos(db, card_id, user)
    photo = (
        db.query(CardPhoto)
        .filter(CardPhoto.id == photo_id, CardPhoto.card_id == card.id)
        .first()
    )
    if photo is None:
        raise HTTPException(status_code=404, detail="Фотография не найдена")
    images.delete_photo_files(photo.url, photo.thumb_url, settings.upload_dir_abs)
    db.delete(photo)
    db.commit()


# ─── Profile ───

@router.patch("/profile", response_model=schemas.UserOut)
def update_profile(
    data: schemas.ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    provided = data.model_dump(exclude_unset=True)
    if "name" in provided:
        name = sanitize_string(provided["name"], max_len=120)
        if not name:
            raise HTTPException(status_code=400, detail="Укажите имя")
        user.name = name
    for field, max_len in (("phone", 40), ("city", 120), ("country", 120)):
        if field in provided:
            setattr(user, field, sanitize_string(provided[field], max_len=max_len) or None)
    db.commit()
    db.refresh(user)
    return user

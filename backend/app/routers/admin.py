"""Admin & moderation API (U6): everything behind require_admin.

Moderation transitions, admin side (KTD-3):
- approve:        pending | needs_revision | rejected | hidden -> published
- reject:         pending -> rejected        (comment required)
- needs-revision: pending -> needs_revision  (comment required)
- hide:           published -> hidden
- show:           hidden -> published
Every transition writes a ModerationEvent (the dashboard activity feed reads them).
Admin PATCH edits a card WITHOUT touching its status (no published->pending rule).
"""
import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.auth import require_admin, sanitize_string
from app.database import get_db
from app.models import (
    Card,
    CardStatus,
    Category,
    Event,
    ModerationEvent,
    User,
    UserRole,
    utcnow,
)
from app.routers.cabinet import (
    _apply_optional_fields,
    _clean_multiline,
    _get_card,
    _replace_products,
    _validate_category,
    _validate_name,
    _validate_short_description,
)
from app.services.slugs import make_slug, slugify

router = APIRouter(prefix="/admin", tags=["admin"])

ACTIVITY_LIMIT = 30

APPROVE_SOURCES = {
    CardStatus.pending,
    CardStatus.needs_revision,
    CardStatus.rejected,
    CardStatus.hidden,
}

# ModerationEvent.action -> (ActivityItem.kind, Russian text template)
_ACTION_ACTIVITY = {
    "approve": ("card_approved", "Одобрена карточка «{name}»"),
    "reject": ("card_rejected", "Отклонена карточка «{name}»"),
    "needs_revision": ("card_needs_revision", "Карточка «{name}» отправлена на доработку"),
    "hide": ("card_hidden", "Скрыта карточка «{name}»"),
    "show": ("card_shown", "Карточка «{name}» снова опубликована"),
}

# Synthetic id offsets keep merged ActivityItem ids unique across the 3 sources
_ACTIVITY_USER_ID_OFFSET = 1_000_000
_ACTIVITY_CARD_ID_OFFSET = 2_000_000


# ─── Helpers ───

def _card_with_relations(db: Session, card_id: int) -> Card:
    card = (
        db.query(Card)
        .options(
            joinedload(Card.category),
            joinedload(Card.owner),
            selectinload(Card.photos),
            selectinload(Card.products),
        )
        .filter(Card.id == card_id)
        .first()
    )
    if card is None:
        raise HTTPException(status_code=404, detail="Карточка не найдена")
    return card


def _log_moderation(db: Session, card: Card, admin: User, action: str, comment: Optional[str] = None):
    db.add(ModerationEvent(card_id=card.id, admin_id=admin.id, action=action, comment=comment))


def _transition(db: Session, card: Card, admin: User, action: str, new_status: CardStatus,
                comment: Optional[str] = None) -> schemas.CardOut:
    card.status = new_status
    card.updated_at = utcnow()
    _log_moderation(db, card, admin, action, comment)
    db.commit()
    db.refresh(card)
    return schemas.card_to_out(card)


def _get_event(db: Session, event_id: int) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Событие не найдено")
    return event


def _get_category(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category


def _category_out(db: Session, category: Category) -> schemas.CategoryOut:
    total = (
        db.query(func.count(Card.id)).filter(Card.category_id == category.id).scalar() or 0
    )
    return schemas.CategoryOut(
        id=category.id,
        name=category.name,
        slug=category.slug,
        sort_order=category.sort_order,
        cards_count=total,
    )


def _validate_event_title(raw: Optional[str]) -> str:
    title = sanitize_string(raw, max_len=200)
    if not title or len(title) < 2:
        raise HTTPException(status_code=400, detail="Название события должно содержать минимум 2 символа")
    return title


# Simple string event fields with their column length caps
_EVENT_TEXT_FIELDS = {"image_url": 500, "location": 200, "link": 500}


def _apply_event_fields(event: Event, data) -> None:
    provided = data.model_dump(exclude_unset=True)
    if "title" in provided:
        event.title = _validate_event_title(provided["title"])
    if "description" in provided:
        event.description = _clean_multiline(provided["description"])
    for field, max_len in _EVENT_TEXT_FIELDS.items():
        if field in provided:
            setattr(event, field, sanitize_string(provided[field], max_len=max_len) or None)
    for field in ("type", "status", "is_featured"):
        if field in provided and provided[field] is not None:
            setattr(event, field, provided[field])
    for field in ("date_start", "date_end"):  # explicit nulls clear the dates
        if field in provided:
            setattr(event, field, provided[field])


# ─── Dashboard: stats & activity ───

@router.get("/stats", response_model=schemas.AdminStatsOut)
def stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """M3 dashboard counters. Deltas = objects created within the last 7 days.

    pending_delta_7d counts cards created in the last 7 days that are currently
    pending — the simplest honest reading (we don't track when a card *entered*
    pending, only moderation_events for admin actions).
    """
    week_ago = utcnow() - datetime.timedelta(days=7)

    def count_cards(status: CardStatus, since=None) -> int:
        query = db.query(func.count(Card.id)).filter(Card.status == status)
        if since is not None:
            query = query.filter(Card.created_at >= since)
        return query.scalar() or 0

    def count_entrepreneurs(since=None) -> int:
        query = db.query(func.count(User.id)).filter(User.role == UserRole.entrepreneur)
        if since is not None:
            query = query.filter(User.created_at >= since)
        return query.scalar() or 0

    def count_events(since=None) -> int:
        query = db.query(func.count(Event.id))
        if since is not None:
            query = query.filter(Event.created_at >= since)
        return query.scalar() or 0

    return schemas.AdminStatsOut(
        pending_cards=count_cards(CardStatus.pending),
        published_cards=count_cards(CardStatus.published),
        entrepreneurs=count_entrepreneurs(),
        events=count_events(),
        pending_delta_7d=count_cards(CardStatus.pending, week_ago),
        published_delta_7d=count_cards(CardStatus.published, week_ago),
        entrepreneurs_delta_7d=count_entrepreneurs(week_ago),
        events_delta_7d=count_events(week_ago),
    )


@router.get("/activity", response_model=list[schemas.ActivityItemOut])
def activity(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Last 30 items merged from moderation events, registrations, and card creations."""
    items: list[schemas.ActivityItemOut] = []

    moderation = (
        db.query(ModerationEvent)
        .options(joinedload(ModerationEvent.card))
        .order_by(ModerationEvent.created_at.desc(), ModerationEvent.id.desc())
        .limit(ACTIVITY_LIMIT)
        .all()
    )
    for entry in moderation:
        kind, template = _ACTION_ACTIVITY.get(
            entry.action, (f"card_{entry.action}", "Карточка «{name}»: " + entry.action)
        )
        name = entry.card.name if entry.card else "—"
        items.append(
            schemas.ActivityItemOut(
                id=entry.id, kind=kind, text=template.format(name=name), created_at=entry.created_at
            )
        )

    users = db.query(User).order_by(User.created_at.desc(), User.id.desc()).limit(ACTIVITY_LIMIT).all()
    for user in users:
        items.append(
            schemas.ActivityItemOut(
                id=_ACTIVITY_USER_ID_OFFSET + user.id,
                kind="user_registered",
                text=f"Зарегистрирован пользователь {user.name}",
                created_at=user.created_at,
            )
        )

    cards = db.query(Card).order_by(Card.created_at.desc(), Card.id.desc()).limit(ACTIVITY_LIMIT).all()
    for card in cards:
        items.append(
            schemas.ActivityItemOut(
                id=_ACTIVITY_CARD_ID_OFFSET + card.id,
                kind="card_created",
                text=f"Создана карточка «{card.name}»",
                created_at=card.created_at,
            )
        )

    items.sort(key=lambda item: (item.created_at, item.id), reverse=True)
    return items[:ACTIVITY_LIMIT]


# ─── Cards: queue & moderation actions ───

@router.get("/cards", response_model=list[schemas.CardOut])
def admin_cards(
    status: Optional[str] = Query(None, description="all или один из статусов карточки"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Card).options(
        joinedload(Card.category),
        joinedload(Card.owner),
        selectinload(Card.photos),
        selectinload(Card.products),
    )
    if status and status != "all":
        try:
            card_status = CardStatus(status)
        except ValueError:
            raise HTTPException(status_code=422, detail="Неизвестный статус карточки")
        query = query.filter(Card.status == card_status)
    cards = query.order_by(Card.updated_at.desc(), Card.id.desc()).all()
    return [schemas.card_to_out(c) for c in cards]


@router.post("/cards/{card_id}/approve", response_model=schemas.CardOut)
def approve_card(
    card_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    card = _card_with_relations(db, card_id)
    if card.status not in APPROVE_SOURCES:
        raise HTTPException(
            status_code=409,
            detail=f"Карточку со статусом «{card.status.value}» нельзя опубликовать",
        )
    card.admin_comment = None
    return _transition(db, card, admin, "approve", CardStatus.published)


@router.post("/cards/{card_id}/reject", response_model=schemas.CardOut)
def reject_card(
    card_id: int,
    data: schemas.ModerationCommentIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    card = _card_with_relations(db, card_id)
    if card.status != CardStatus.pending:
        raise HTTPException(
            status_code=409,
            detail=f"Отклонить можно только карточку на проверке (сейчас «{card.status.value}»)",
        )
    card.admin_comment = data.comment
    return _transition(db, card, admin, "reject", CardStatus.rejected, data.comment)


@router.post("/cards/{card_id}/needs-revision", response_model=schemas.CardOut)
def needs_revision_card(
    card_id: int,
    data: schemas.ModerationCommentIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    card = _card_with_relations(db, card_id)
    if card.status != CardStatus.pending:
        raise HTTPException(
            status_code=409,
            detail=f"На доработку можно отправить только карточку на проверке (сейчас «{card.status.value}»)",
        )
    card.admin_comment = data.comment
    return _transition(db, card, admin, "needs_revision", CardStatus.needs_revision, data.comment)


@router.post("/cards/{card_id}/hide", response_model=schemas.CardOut)
def hide_card(
    card_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    card = _card_with_relations(db, card_id)
    if card.status != CardStatus.published:
        raise HTTPException(
            status_code=409,
            detail=f"Скрыть можно только опубликованную карточку (сейчас «{card.status.value}»)",
        )
    return _transition(db, card, admin, "hide", CardStatus.hidden)


@router.post("/cards/{card_id}/show", response_model=schemas.CardOut)
def show_card(
    card_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    card = _card_with_relations(db, card_id)
    if card.status != CardStatus.hidden:
        raise HTTPException(
            status_code=409,
            detail=f"Вернуть на сайт можно только скрытую карточку (сейчас «{card.status.value}»)",
        )
    return _transition(db, card, admin, "show", CardStatus.published)


@router.patch("/cards/{card_id}", response_model=schemas.CardOut)
def admin_update_card(
    card_id: int,
    data: schemas.AdminCardUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin edit of any card. Status is never changed here — in particular the
    KTD-3 "owner edit of published -> pending" rule does NOT apply to admins."""
    card = _card_with_relations(db, card_id)
    provided = data.model_dump(exclude_unset=True)

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
    if "is_featured" in provided:
        card.is_featured = bool(provided["is_featured"])

    card.updated_at = utcnow()
    db.commit()
    db.refresh(card)
    return schemas.card_to_out(card)


# ─── Users ───

@router.get("/users", response_model=list[schemas.AdminUserOut])
def admin_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    counts = dict(
        db.query(Card.owner_id, func.count(Card.id)).group_by(Card.owner_id).all()
    )
    users = db.query(User).order_by(User.created_at.desc(), User.id.desc()).all()
    out = []
    for user in users:
        item = schemas.AdminUserOut.model_validate(user)
        item.cards_count = counts.get(user.id, 0)
        out.append(item)
    return out


# ─── Categories CRUD ───

@router.post("/categories", response_model=schemas.CategoryOut, status_code=201)
def create_category(
    data: schemas.CategoryCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    name = sanitize_string(data.name, max_len=120)
    if not name:
        raise HTTPException(status_code=400, detail="Укажите название категории")
    slug = slugify(name)
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(status_code=409, detail="Категория с таким названием уже существует")
    category = Category(name=name, slug=slug, sort_order=data.sort_order or 0)
    db.add(category)
    db.commit()
    db.refresh(category)
    return _category_out(db, category)


@router.patch("/categories/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    data: schemas.CategoryUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    category = _get_category(db, category_id)
    provided = data.model_dump(exclude_unset=True)
    if "name" in provided:
        name = sanitize_string(provided["name"], max_len=120)
        if not name:
            raise HTTPException(status_code=400, detail="Укажите название категории")
        slug = slugify(name)
        clash = db.query(Category).filter(Category.slug == slug, Category.id != category.id).first()
        if clash:
            raise HTTPException(status_code=409, detail="Категория с таким названием уже существует")
        category.name = name
        category.slug = slug
    if "sort_order" in provided and provided["sort_order"] is not None:
        category.sort_order = provided["sort_order"]
    db.commit()
    db.refresh(category)
    return _category_out(db, category)


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    category = _get_category(db, category_id)
    cards_count = db.query(func.count(Card.id)).filter(Card.category_id == category.id).scalar() or 0
    if cards_count:
        raise HTTPException(
            status_code=409,
            detail=f"Нельзя удалить категорию: в ней {cards_count} карточек. Сначала перенесите их.",
        )
    db.delete(category)
    db.commit()


# ─── Events (афиша) CRUD ───

@router.get("/events", response_model=list[schemas.EventOut])
def admin_events(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """All events regardless of status (admin section)."""
    events = (
        db.query(Event)
        .order_by(Event.date_start.desc().nulls_last(), Event.id.desc())
        .all()
    )
    return events


@router.post("/events", response_model=schemas.EventOut, status_code=201)
def create_event(
    data: schemas.EventCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    event = Event(
        title=_validate_event_title(data.title),
        type=data.type,
        image_url=sanitize_string(data.image_url, max_len=500) or None,
        date_start=data.date_start,
        date_end=data.date_end,
        location=sanitize_string(data.location, max_len=200) or None,
        description=_clean_multiline(data.description),
        link=sanitize_string(data.link, max_len=500) or None,
        status=data.status,
        is_featured=data.is_featured,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/events/{event_id}", response_model=schemas.EventOut)
def update_event(
    event_id: int,
    data: schemas.EventUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    event = _get_event(db, event_id)
    _apply_event_fields(event, data)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    event = _get_event(db, event_id)
    db.delete(event)
    db.commit()

"""Public catalog API (U5, KTD-5): published cards only. Public events + SEO (U7).

Search/filter/sort/pagination are server-side; card detail resolves slugs by
the trailing "-{id}" suffix so renamed slugs keep working (R10).
"""
from typing import Optional
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.auth import get_current_user, get_optional_user
from app.config import settings
from app.database import get_db
from app.models import Card, CardLike, CardStatus, Category, Event, EventStatus, User
from app.services.slugs import extract_id

router = APIRouter(prefix="/catalog", tags=["catalog"])

# sitemap.xml lives outside the /catalog prefix; main.py mounts this router
# both under /api and at the root (nginx also proxies /sitemap.xml in prod)
seo_router = APIRouter(tags=["seo"])

# Publicly visible event statuses: finished events stay served for the archive
PUBLIC_EVENT_STATUSES = (EventStatus.published, EventStatus.finished)


def _with_relations(query):
    """Eager-load everything card_to_out needs (category/owner, photos, products, likes)."""
    return query.options(
        joinedload(Card.category),
        joinedload(Card.owner),
        selectinload(Card.photos),
        selectinload(Card.products),
        selectinload(Card.likes),
    )


def _published(db: Session):
    return db.query(Card).filter(Card.status == CardStatus.published)


@router.get("/cards", response_model=schemas.PaginatedCards)
def list_cards(
    q: Optional[str] = None,
    category: Optional[str] = None,  # category slug
    country: Optional[str] = None,
    city: Optional[str] = None,
    sort: str = Query("new", pattern="^(new|featured|name)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
    current: Optional[User] = Depends(get_optional_user),
):
    query = _published(db)

    if q and q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Card.name.ilike(like),
                Card.short_description.ilike(like),
                Card.full_description.ilike(like),
                Card.city.ilike(like),
                Card.country.ilike(like),
            )
        )
    if category:
        query = query.join(Category, Card.category_id == Category.id).filter(
            Category.slug == category
        )
    if country:
        query = query.filter(Card.country.ilike(country))
    if city:
        query = query.filter(Card.city.ilike(city))

    if sort == "name":
        query = query.order_by(Card.name.asc(), Card.id.asc())
    elif sort == "featured":
        query = query.order_by(Card.is_featured.desc(), Card.created_at.desc(), Card.id.desc())
    else:  # "new" (default)
        query = query.order_by(Card.created_at.desc(), Card.id.desc())

    total = query.count()
    cards = _with_relations(query).offset((page - 1) * per_page).limit(per_page).all()
    uid = current.id if current else None
    return schemas.PaginatedCards(
        items=[schemas.card_to_out(c, uid) for c in cards], total=total
    )


def _resolve_published_card(db: Session, slug: str) -> Card:
    """Resolve a card by slug: id suffix first (rename-proof), exact slug as fallback."""
    query = _with_relations(db.query(Card))
    card_id = extract_id(slug)
    card = query.filter(Card.id == card_id).first() if card_id is not None else None
    if card is None:
        card = query.filter(Card.slug == slug).first()
    if card is None or card.status != CardStatus.published:
        raise HTTPException(status_code=404, detail="Карточка не найдена")
    return card


@router.get("/cards/{slug}", response_model=schemas.CardOut)
def get_card(
    slug: str,
    db: Session = Depends(get_db),
    current: Optional[User] = Depends(get_optional_user),
):
    card = _resolve_published_card(db, slug)
    card.views_count = (card.views_count or 0) + 1  # count every detail view
    db.commit()
    return schemas.card_to_out(card, current.id if current else None)


@router.get("/cards/{slug}/similar", response_model=list[schemas.CardOut])
def similar_cards(
    slug: str,
    db: Session = Depends(get_db),
    current: Optional[User] = Depends(get_optional_user),
):
    card = _resolve_published_card(db, slug)
    cards = (
        _with_relations(_published(db))
        .filter(Card.category_id == card.category_id, Card.id != card.id)
        .order_by(Card.created_at.desc(), Card.id.desc())
        .limit(5)
        .all()
    )
    uid = current.id if current else None
    return [schemas.card_to_out(c, uid) for c in cards]


# ─── Engagement metrics: click / like / unlike ───

@router.post("/cards/{slug}/click", response_model=schemas.ClickCountOut)
def click_card(
    slug: str,
    db: Session = Depends(get_db),
    current: Optional[User] = Depends(get_optional_user),  # optional: guests count too
):
    """Register a «Связаться» click. Increments clicks_count; guests are counted."""
    card = _resolve_published_card(db, slug)
    card.clicks_count = (card.clicks_count or 0) + 1
    db.commit()
    return schemas.ClickCountOut(clicks_count=card.clicks_count)


@router.post("/cards/{slug}/like", response_model=schemas.LikeStateOut)
def like_card(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Like a card as the current user. Idempotent: liking twice stays liked."""
    card = _resolve_published_card(db, slug)
    existing = (
        db.query(CardLike)
        .filter(CardLike.card_id == card.id, CardLike.user_id == user.id)
        .first()
    )
    if existing is None:
        db.add(CardLike(card_id=card.id, user_id=user.id))
        db.commit()
    return schemas.LikeStateOut(likes_count=_likes_count(db, card.id), liked=True)


@router.delete("/cards/{slug}/like", response_model=schemas.LikeStateOut)
def unlike_card(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remove the current user's like. Idempotent: unliking when not liked is fine."""
    card = _resolve_published_card(db, slug)
    db.query(CardLike).filter(
        CardLike.card_id == card.id, CardLike.user_id == user.id
    ).delete(synchronize_session=False)
    db.commit()
    return schemas.LikeStateOut(likes_count=_likes_count(db, card.id), liked=False)


def _likes_count(db: Session, card_id: int) -> int:
    return db.query(func.count(CardLike.user_id)).filter(CardLike.card_id == card_id).scalar() or 0


@router.get("/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    published_counts = dict(
        db.query(Card.category_id, func.count(Card.id))
        .filter(Card.status == CardStatus.published)
        .group_by(Card.category_id)
        .all()
    )
    categories = db.query(Category).order_by(Category.sort_order.asc(), Category.id.asc()).all()
    return [
        schemas.CategoryOut(
            id=c.id,
            name=c.name,
            slug=c.slug,
            sort_order=c.sort_order,
            cards_count=published_counts.get(c.id, 0),
        )
        for c in categories
    ]


# ─── Events (афиша, U7) ───

@router.get("/events", response_model=list[schemas.EventOut])
def list_events(featured: bool = False, db: Session = Depends(get_db)):
    """Public афиша: published + finished (archive), newest first, nulls last.

    ?featured=true — the homepage carousel: featured AND published only.
    """
    query = db.query(Event)
    if featured:
        query = query.filter(Event.is_featured.is_(True), Event.status == EventStatus.published)
    else:
        query = query.filter(Event.status.in_(PUBLIC_EVENT_STATUSES))
    return query.order_by(Event.date_start.desc().nulls_last(), Event.id.desc()).all()


@router.get("/events/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None or event.status not in PUBLIC_EVENT_STATUSES:
        raise HTTPException(status_code=404, detail="Событие не найдено")
    return event


# ─── SEO: sitemap.xml (U7, R10) ───

@seo_router.get("/sitemap.xml")
def sitemap(db: Session = Depends(get_db)):
    base = settings.SITE_URL.rstrip("/")
    # (loc, lastmod) pairs; lastmod only where we have an honest updated_at
    urls: list[tuple[str, Optional[str]]] = [
        (f"{base}/", None),
        (f"{base}/catalog", None),
        (f"{base}/afisha", None),
        (f"{base}/about", None),
    ]
    categories = db.query(Category).order_by(Category.sort_order.asc(), Category.id.asc()).all()
    urls.extend((f"{base}/catalog?cat={c.slug}", None) for c in categories)
    published = (
        db.query(Card.slug, Card.updated_at)
        .filter(Card.status == CardStatus.published, Card.slug.isnot(None))
        .order_by(Card.id.asc())
        .all()
    )
    urls.extend(
        (f"{base}/catalog/{slug}", updated_at.date().isoformat() if updated_at else None)
        for slug, updated_at in published
    )

    entries = []
    for loc, lastmod in urls:
        lastmod_tag = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
        entries.append(f"  <url><loc>{escape(loc)}</loc>{lastmod_tag}</url>")
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml")

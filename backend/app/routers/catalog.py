"""Public catalog API (U5, KTD-5): published cards only.

Search/filter/sort/pagination are server-side; card detail resolves slugs by
the trailing "-{id}" suffix so renamed slugs keep working (R10).
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.database import get_db
from app.models import Card, CardStatus, Category
from app.services.slugs import extract_id

router = APIRouter(prefix="/catalog", tags=["catalog"])


def _with_relations(query):
    """Eager-load everything card_to_out needs (category/owner names, photos, products)."""
    return query.options(
        joinedload(Card.category),
        joinedload(Card.owner),
        selectinload(Card.photos),
        selectinload(Card.products),
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
    return schemas.PaginatedCards(items=[schemas.card_to_out(c) for c in cards], total=total)


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
def get_card(slug: str, db: Session = Depends(get_db)):
    return schemas.card_to_out(_resolve_published_card(db, slug))


@router.get("/cards/{slug}/similar", response_model=list[schemas.CardOut])
def similar_cards(slug: str, db: Session = Depends(get_db)):
    card = _resolve_published_card(db, slug)
    cards = (
        _with_relations(_published(db))
        .filter(Card.category_id == card.category_id, Card.id != card.id)
        .order_by(Card.created_at.desc(), Card.id.desc())
        .limit(5)
        .all()
    )
    return [schemas.card_to_out(c) for c in cards]


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

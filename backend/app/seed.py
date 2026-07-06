"""Idempotent seed: TZ §6.1 categories, admin from env, seed entrepreneur owning
the cards ported from src/initialData.ts, and the initial events.

Idempotency keys: users by email, categories by slug, cards by name, events by title.
Ratings from initialData are dropped (not in MVP); is_featured is kept.

Usage:  venv/bin/python -m app.seed   (run `alembic upgrade head` first)
"""
import datetime
import re

from sqlalchemy.orm import Session

from app.auth import hash_password, normalize_email
from app.config import settings
from app.models import (
    Card,
    CardPhoto,
    CardProduct,
    CardStatus,
    Category,
    Event,
    EventStatus,
    EventType,
    User,
    UserCredential,
    UserRole,
)
from app.services.slugs import make_slug, slugify

# Dev-only password for the seed entrepreneur account
SEED_ENTREPRENEUR_EMAIL = "asker@sigup.ru"
SEED_ENTREPRENEUR_PASSWORD = "sigup2026"

# ─── TZ §6.1 categories ───
CATEGORIES = [
    "Продукты",
    "Изделия ручной работы",
    "Книги",
    "Парфюмерия",
    "Соль и традиционные товары",
    "Одежда и аксессуары",
    "Культура и творчество",
    "Услуги",
    "Мероприятия",
    "Другое",
]

_RU_MONTHS = {
    "января": 1, "февраля": 2, "марта": 3, "апреля": 4, "мая": 5, "июня": 6,
    "июля": 7, "августа": 8, "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12,
}


def parse_ru_date(text: str) -> datetime.date:
    """Parse '25 мая 2025' -> date(2025, 5, 25)."""
    match = re.match(r"(\d{1,2})\s+(\S+)\s+(\d{4})", text.strip())
    if not match:
        raise ValueError(f"Cannot parse Russian date: {text!r}")
    day, month_name, year = match.groups()
    return datetime.date(int(year), _RU_MONTHS[month_name.lower()], int(day))


def parse_ru_date_range(text: str):
    """Parse '14–15 июня 2025' -> (date_start, date_end); single dates -> (date, None)."""
    match = re.match(r"(\d{1,2})\s*[–—-]\s*(\d{1,2})\s+(\S+)\s+(\d{4})", text.strip())
    if match:
        d1, d2, month_name, year = match.groups()
        month = _RU_MONTHS[month_name.lower()]
        return (
            datetime.date(int(year), month, int(d1)),
            datetime.date(int(year), month, int(d2)),
        )
    return parse_ru_date(text), None


# ─── Cards ported from src/initialData.ts (ratings dropped — not in MVP) ───
INITIAL_CARDS = [
    {
        "name": "Сырная мастерская «Уздых»",
        "category": "Продукты",
        "short_description": "Натуральные адыгейские сыры по традиционным рецептам. Только молоко, соль и время.",
        "full_description": "Сырная мастерская «Уздых» — это семейное дело, где бережно хранят традиции сыроделия Адыгеи. Мы производим натуральные сыры из свежего коровьего молока, без консервантов и растительных жиров.\n\nНаши сыры созревают естественным образом, сохраняя насыщенный вкус, нежную текстуру и пользу настоящего продукта. Мы уверены, что простые и честные продукты делают жизнь вкуснее и здоровее. Поддерживая нас, вы поддерживаете локальное производство и традиции предков.",
        "photos": [
            "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
        ],
        "country": "Россия",
        "city": "Майкоп",
        "address": "Республика Адыгея, г. Майкоп, ул. Шовгенова, 35",
        "lat": 44.6098,
        "lng": 40.1006,
        "instagram": "@uedyzh_cheese",
        "phone": "+7 (928) 123-45-67",
        "whatsapp": "+79281234567",
        "telegram": "uedyzh_cheese",
        "website": "uedyzh-cheese.ru",
        "price_info": "Цены уточняйте у продавца",
        "delivery_info": "Доставляем по Майкопу и Адыгее. В другие регионы — по договорённости.",
        "status": CardStatus.published,
        "is_featured": True,
        "updated_at": "25 мая 2025",
        "products": [
            {
                "name": "Адыгейский сыр",
                "price": "по запросу",
                "description": "Классический мягкий сыр из свежего молока.",
                "image_url": "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=400",
            },
            {
                "name": "Копченый сыр",
                "price": "по запросу",
                "description": "Нежный сыр с лёгким дымным ароматом.",
                "image_url": "https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&q=80&w=400",
            },
            {
                "name": "Сырные наборы",
                "price": "уточняйте",
                "description": "Подборки сыров для вашего стола или в подарок.",
                "image_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400",
            },
            {
                "name": "Домашнее масло",
                "price": "уточняйте",
                "description": "Натуральное сливочное масло из свежих сливок.",
                "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
            },
        ],
    },
    {
        "name": "Керамика «Тхьэм и Дзыхь»",
        "category": "Изделия ручной работы",
        "short_description": "Авторская керамика с древнечеркесскими орнаментами и философией.",
        "full_description": "Мастерская этнической керамики. Название переводится как 'Доверенное Богу'. Мы создаем уникальную и долговечную глиняную посуду, гравируем её аутентичными кавказскими узорами, каждый из которых имеет своё глубокое сакральное значение.\n\nКаждое изделие лепится вручную, проходит несколько обжигов и покрывается качественной пищевой глазурью или обрабатывается молочным обжигом по старинной технологии.",
        "photos": [
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
        ],
        "country": "Россия",
        "city": "Нальчик",
        "address": "Республика Кабардино-Балкария, г. Нальчик, ул. Ленина, 12",
        "instagram": "@tkha_ceramics",
        "phone": "+7 (905) 555-44-33",
        "whatsapp": "+79055554433",
        "telegram": "tkha_ceramics",
        "status": CardStatus.published,
        "is_featured": True,
        "updated_at": "20 мая 2025",
        "products": [
            {
                "name": "Глиняная пиала с узором",
                "price": "1 200 ₽",
                "description": "Ручная лепка, традиционный черкесский орнамент.",
                "image_url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400",
            },
        ],
    },
    {
        "name": "Издательство «Псыпэ»",
        "category": "Книги",
        "short_description": "Книги об истории, культуре, языке и выдающихся личностях адыгов.",
        "full_description": "Издательский проект «Псыпэ» занимается популяризацией черкесской литературы, архивных материалов, словарей и научно-популярных книг о Кавказе. Мы переиздаем редкие труды и открываем современных авторов, пишущих на адыгейском, кабардинском и русском языках.",
        "photos": [
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
        ],
        "country": "Россия",
        "city": "Москва",
        "address": "г. Москва, ул. Арбат, 22",
        "instagram": "@psype_books",
        "phone": "+7 (495) 777-66-55",
        "whatsapp": "+74957776655",
        "website": "psype-books.ru",
        "status": CardStatus.published,
        "is_featured": True,
        "updated_at": "18 мая 2025",
    },
    {
        "name": "ZEPHYR Parfum",
        "category": "Парфюмерия",
        "short_description": "Нишевая парфюмерия с вдохновением горного Кавказа и черкесских трав.",
        "full_description": "Парфюмерный бренд ZEPHYR создает неповторимые селективные ароматы. В основе наших композиций лежат эфирные масла кавказского чабреца, горной полыни, хвои, дикого мёда и чистейших ледниковых нот.\n\nАромат, который переносит в самое сердце гор утренней прохлады.",
        "photos": [
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
        ],
        "country": "Турция",
        "city": "Стамбул",
        "address": "Istanbul, Besiktas, Barbaros Blv., 74",
        "instagram": "@zephyr_parfum",
        "phone": "+90 (532) 000-11-22",
        "whatsapp": "905320001122",
        "status": CardStatus.published,
        "is_featured": True,
        "updated_at": "24 июня 2025",
    },
    {
        "name": "Digital Apsny",
        "category": "Услуги",
        "short_description": "Веб-разработка, дизайн, брендинг и продвижение вашего бизнеса.",
        "full_description": "Профессиональная команда разработчиков и дизайнеров. Мы помогаем предпринимателям Кавказа и диаспоры выходить в онлайн: разрабатываем сайты, настраиваем рекламу, проектируем логотипы, бережно интегрируя национальные мотивы в современный digital-дизайн.",
        "photos": [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        ],
        "country": "Россия",
        "city": "Краснодар",
        "address": "г. Краснодар, ул. Красная, 110",
        "instagram": "@digital_apsny",
        "phone": "+7 (918) 444-55-66",
        "telegram": "digital_apsny",
        "status": CardStatus.published,
        "is_featured": True,
        "updated_at": "22 июня 2025",
    },
    {
        "name": "Пасека «Горный мёд»",
        "category": "Продукты",
        "short_description": "Дикий альпийский мёд, перга и продукты пчеловодства из заповедной зоны.",
        "full_description": "Пасека расположена на высоте 1800 метров над уровнем моря, вдали от трасс и производств. Пчёлы собирают нектар с реликтовых кавказских медоносов.",
        "photos": ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"],
        "country": "Россия",
        "city": "Майкопский район",
        "status": CardStatus.published,
        "updated_at": "19 мая 2025",
    },
    {
        "name": "Травяные чаи «Адыгэ»",
        "category": "Продукты",
        "short_description": "Сборные горные чаи ручной сушки. Чабрец, мята, шиповник.",
        "full_description": "Ароматные и оздоравливающие купажи, собранные вручную жительницами предгорных селений Адыгеи.",
        "photos": ["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800"],
        "country": "Россия",
        "city": "Каменномостский",
        "status": CardStatus.published,
        "updated_at": "17 мая 2025",
    },
    {
        "name": "Этно-тур по Черекскому ущелью",
        "category": "Услуги",
        "short_description": "Конные прогулки и исторические экскурсии к родовым башням.",
        "full_description": "Полноценный тур выходного дня: древние башни Безинги, Голубые озёра, Черкские ущелья, верховая езда и традиционный ужин у костра.\n\nПрогулки проводятся опытными гидами, знающими историю каждого камня.",
        "photos": ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"],
        "country": "Россия",
        "city": "Кабардино-Балкарская Республика",
        "status": CardStatus.pending,
        "updated_at": "19 мая 2025",
    },
    {
        "name": "Резные изделия «Древо жизни»",
        "category": "Изделия ручной работы",
        "short_description": "Эксклюзивные панно, столики-анэ и сувениры из кавказского дуба.",
        "full_description": "Ручная резьба по благородному дереву. Изготовление традиционных праздничных столиков анэ, шкатулок с узорами.",
        "photos": ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"],
        "country": "Россия",
        "city": "Владикавказ, РСО-Алания",
        "status": CardStatus.pending,
        "updated_at": "24 июня 2025",
    },
    {
        "name": "Фестиваль адыгского сыра",
        "category": "Продукты",
        "short_description": "Праздничный выездной маркет сыров, мастер-классы.",
        "full_description": "Маркетинговая карточка со списком участников-производителей. Позволяет заказать традиционные соленые и копченые сыры напрямую.",
        "photos": ["https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800"],
        "country": "Россия",
        "city": "Майкоп, Республика Адыгея",
        "status": CardStatus.published,
        "updated_at": "25 мая 2025",
    },
]

# ─── Events ported from src/initialData.ts (type "Мероприятие" -> EventType.event) ───
INITIAL_EVENTS = [
    {
        "title": "День черкесской культуры",
        "image_url": "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=800",
        "dates": "25 мая 2025",
        "location": "Москва",
        "description": "Концерт, выставка национальных костюмов и традиционные угощения адыгов в столице.",
    },
    {
        "title": "Фестиваль адыгского сыра",
        "image_url": "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=800",
        "dates": "7 июня 2025",
        "location": "Майкоп",
        "description": "Крупнейшее кулинарное событие региона. Дегустация, кулинарные поединки сыроваров.",
    },
    {
        "title": "Выставка «Наследие гор»",
        "image_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
        "dates": "14–15 июня 2025",
        "location": "Нальчик",
        "description": "Выставка живописи современных художников Северного Кавказа, посвященная традиционному быту.",
    },
    {
        "title": "Вечер адыгского танца",
        "image_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800",
        "dates": "21 июня 2025",
        "location": "Стамбул",
        "description": "Традиционная джегу (танцевальный круг) черкесской диаспоры в историческом центре Стамбула.",
    },
    {
        "title": "Этно-тур по Черкесии",
        "image_url": "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=800",
        "dates": "28–29 июня 2025",
        "location": "Каменномостский",
        "description": "Посещение водопадов Руфабго, Хаджохской теснины и встреча с мастерами народных промыслов.",
    },
]


def _get_or_create_user(db: Session, email: str, name: str, password: str, role: UserRole, **kwargs) -> tuple:
    email = normalize_email(email)
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user, False
    user = User(name=name, email=email, role=role, **kwargs)
    db.add(user)
    db.flush()
    db.add(UserCredential(user_id=user.id, password_hash=hash_password(password)))
    db.commit()
    db.refresh(user)
    return user, True


def run(db: Session) -> dict:
    """Run the seed. Idempotent. Returns counts of created objects."""
    created = {"users": 0, "categories": 0, "cards": 0, "photos": 0, "products": 0, "events": 0}

    # Admin from env
    _, was_created = _get_or_create_user(
        db,
        email=settings.ADMIN_EMAIL,
        name="Администратор SiGup",
        password=settings.ADMIN_PASSWORD,
        role=UserRole.admin,
    )
    created["users"] += int(was_created)

    # Seed entrepreneur — owner of the ported cards
    entrepreneur, was_created = _get_or_create_user(
        db,
        email=SEED_ENTREPRENEUR_EMAIL,
        name="Аскер Хакунов",
        password=SEED_ENTREPRENEUR_PASSWORD,
        role=UserRole.entrepreneur,
        phone="+7 (928) 123-45-67",
        city="Майкоп",
        country="Россия",
    )
    created["users"] += int(was_created)

    # Categories (TZ §6.1), idempotent by slug
    categories_by_name: dict[str, Category] = {}
    for i, name in enumerate(CATEGORIES):
        slug = slugify(name)
        category = db.query(Category).filter(Category.slug == slug).first()
        if not category:
            category = Category(name=name, slug=slug, sort_order=i)
            db.add(category)
            db.flush()
            created["categories"] += 1
        categories_by_name[name] = category
    db.commit()

    # Cards, idempotent by name
    for data in INITIAL_CARDS:
        if db.query(Card).filter(Card.name == data["name"]).first():
            continue
        updated_at = datetime.datetime.combine(parse_ru_date(data["updated_at"]), datetime.time(12, 0))
        card = Card(
            name=data["name"],
            category_id=categories_by_name[data["category"]].id,
            short_description=data.get("short_description"),
            full_description=data.get("full_description"),
            country=data.get("country"),
            city=data.get("city"),
            address=data.get("address"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            instagram=data.get("instagram"),
            phone=data.get("phone"),
            whatsapp=data.get("whatsapp"),
            telegram=data.get("telegram"),
            website=data.get("website"),
            price_info=data.get("price_info"),
            delivery_info=data.get("delivery_info"),
            status=data["status"],
            is_featured=data.get("is_featured", False),
            owner_id=entrepreneur.id,
            created_at=updated_at,
            updated_at=updated_at,
        )
        db.add(card)
        db.flush()
        card.slug = make_slug(card.name, card.id)
        created["cards"] += 1

        for order, url in enumerate(data.get("photos", [])):
            db.add(CardPhoto(card_id=card.id, url=url, sort_order=order))
            created["photos"] += 1
        for order, product in enumerate(data.get("products", [])):
            db.add(CardProduct(card_id=card.id, sort_order=order, **product))
            created["products"] += 1
    db.commit()

    # Events, idempotent by title
    for data in INITIAL_EVENTS:
        if db.query(Event).filter(Event.title == data["title"]).first():
            continue
        date_start, date_end = parse_ru_date_range(data["dates"])
        db.add(
            Event(
                title=data["title"],
                type=EventType.event,
                image_url=data["image_url"],
                date_start=date_start,
                date_end=date_end,
                location=data["location"],
                description=data["description"],
                status=EventStatus.published,
                is_featured=True,
            )
        )
        created["events"] += 1
    db.commit()

    return created


def main():
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        created = run(db)
        print(f"Seed complete. Created: {created}")
        from app.models import Card as C, Category as Cat, Event as E, User as U

        print(
            "Totals: users=%d categories=%d cards=%d events=%d"
            % (db.query(U).count(), db.query(Cat).count(), db.query(C).count(), db.query(E).count())
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()

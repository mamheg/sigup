"""U5 tests: public catalog (published-only, search/filter/sort, slug resolve, similar,
categories) and cabinet card CRUD with the KTD-3 status machine."""
import datetime

from app.models import Card, CardPhoto, CardProduct, CardStatus, UserRole


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def day(n):
    """Distinct created_at values for deterministic sort tests."""
    return datetime.datetime(2026, 6, 1, 12, 0) + datetime.timedelta(days=n)


# ─── Public catalog: published only (§18.1) ───

def test_catalog_lists_only_published(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    make_card(owner, cat, name="Опубликованная", status=CardStatus.published)
    hidden_statuses = (
        CardStatus.draft,
        CardStatus.pending,
        CardStatus.rejected,
        CardStatus.needs_revision,
        CardStatus.hidden,
    )
    for i, status in enumerate(hidden_statuses):
        make_card(owner, cat, name=f"Скрытая карточка {i}", status=status)

    resp = client.get("/api/catalog/cards")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert [c["name"] for c in body["items"]] == ["Опубликованная"]


def test_catalog_card_by_slug(client, db_session, make_user, make_category, make_card):
    owner, _ = make_user(name="Аскер Хакунов")
    cat = make_category(name="Продукты")
    card = make_card(owner, cat, name="Сырная мастерская", status=CardStatus.published)
    db_session.add(CardPhoto(card_id=card.id, url="https://example.com/a.jpg", sort_order=0))
    db_session.add(CardProduct(card_id=card.id, name="Сыр", price="100 ₽", sort_order=0))
    db_session.commit()

    resp = client.get(f"/api/catalog/cards/{card.slug}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == card.id
    assert body["slug"].endswith(f"-{card.id}")
    assert body["category_name"] == "Продукты"
    assert body["owner_name"] == "Аскер Хакунов"
    assert body["status"] == "published"
    assert [p["url"] for p in body["photos"]] == ["https://example.com/a.jpg"]
    assert [p["name"] for p in body["products"]] == ["Сыр"]
    assert body["products"][0]["price"] == "100 ₽"


def test_catalog_non_published_slug_404(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    for status in (CardStatus.draft, CardStatus.pending, CardStatus.hidden):
        card = make_card(owner, cat, name=f"Карточка {status.value}", status=status)
        assert client.get(f"/api/catalog/cards/{card.slug}").status_code == 404
        assert client.get(f"/api/catalog/cards/{card.slug}/similar").status_code == 404
    assert client.get("/api/catalog/cards/no-such-card-99999").status_code == 404


# ─── Search & filters (§6.2) ───

def test_catalog_search_q_over_fields(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    make_card(owner, cat, name="Мастерская", full_description="Натуральные адыгейские сыры и масло")
    make_card(owner, cat, name="Керамика", short_description="Авторская керамика с орнаментами")
    make_card(owner, cat, name="Пасека", city="Майкоп")

    by_description = client.get("/api/catalog/cards", params={"q": "сыры"}).json()
    assert [c["name"] for c in by_description["items"]] == ["Мастерская"]

    by_short = client.get("/api/catalog/cards", params={"q": "орнамент"}).json()
    assert [c["name"] for c in by_short["items"]] == ["Керамика"]

    by_city = client.get("/api/catalog/cards", params={"q": "Майкоп"}).json()
    assert [c["name"] for c in by_city["items"]] == ["Пасека"]

    nothing = client.get("/api/catalog/cards", params={"q": "несуществующее"}).json()
    assert nothing == {"items": [], "total": 0}


def test_catalog_filters_narrow(client, make_user, make_category, make_card):
    owner, _ = make_user()
    food = make_category(name="Продукты")
    crafts = make_category(name="Изделия ручной работы", sort_order=1)
    make_card(owner, food, name="Сыроварня", country="Россия", city="Майкоп")
    make_card(owner, food, name="Пасека", country="Россия", city="Нальчик")
    make_card(owner, crafts, name="Керамика", country="Турция", city="Стамбул")

    by_category = client.get("/api/catalog/cards", params={"category": food.slug}).json()
    assert {c["name"] for c in by_category["items"]} == {"Сыроварня", "Пасека"}
    assert by_category["total"] == 2

    by_city = client.get(
        "/api/catalog/cards", params={"category": food.slug, "city": "Майкоп"}
    ).json()
    assert [c["name"] for c in by_city["items"]] == ["Сыроварня"]

    by_country = client.get("/api/catalog/cards", params={"country": "Турция"}).json()
    assert [c["name"] for c in by_country["items"]] == ["Керамика"]

    empty = client.get("/api/catalog/cards", params={"category": "no-such-slug"}).json()
    assert empty["total"] == 0


# ─── Sorting (KTD-5) ───

def test_catalog_sort_new_default(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    make_card(owner, cat, name="Старая", created_at=day(0))
    make_card(owner, cat, name="Средняя", created_at=day(1))
    make_card(owner, cat, name="Новая", created_at=day(2))

    body = client.get("/api/catalog/cards").json()
    assert [c["name"] for c in body["items"]] == ["Новая", "Средняя", "Старая"]


def test_catalog_sort_name_alphabetical(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    make_card(owner, cat, name="Вишня", created_at=day(2))
    make_card(owner, cat, name="Арбуз", created_at=day(0))
    make_card(owner, cat, name="Богатырь", created_at=day(1))

    body = client.get("/api/catalog/cards", params={"sort": "name"}).json()
    assert [c["name"] for c in body["items"]] == ["Арбуз", "Богатырь", "Вишня"]


def test_catalog_sort_featured_first(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    make_card(owner, cat, name="Обычная новая", created_at=day(3))
    make_card(owner, cat, name="Featured старая", created_at=day(0), is_featured=True)
    make_card(owner, cat, name="Featured новая", created_at=day(1), is_featured=True)

    body = client.get("/api/catalog/cards", params={"sort": "featured"}).json()
    assert [c["name"] for c in body["items"]] == [
        "Featured новая",
        "Featured старая",
        "Обычная новая",
    ]


def test_catalog_pagination(client, make_user, make_category, make_card):
    owner, _ = make_user()
    cat = make_category()
    for i in range(5):
        make_card(owner, cat, name=f"Карточка номер {i}", created_at=day(i))

    page1 = client.get("/api/catalog/cards", params={"per_page": 2, "page": 1}).json()
    assert page1["total"] == 5
    assert len(page1["items"]) == 2

    page3 = client.get("/api/catalog/cards", params={"per_page": 2, "page": 3}).json()
    assert len(page3["items"]) == 1

    names = [
        c["name"]
        for page in (1, 2, 3)
        for c in client.get(
            "/api/catalog/cards", params={"per_page": 2, "page": page}
        ).json()["items"]
    ]
    assert len(set(names)) == 5  # no repeats/gaps across pages

    assert client.get("/api/catalog/cards", params={"per_page": 101}).status_code == 422
    assert client.get("/api/catalog/cards", params={"page": 0}).status_code == 422


# ─── Similar & categories ───

def test_similar_same_category_excludes_self_max_5(client, make_user, make_category, make_card):
    owner, _ = make_user()
    food = make_category(name="Продукты")
    crafts = make_category(name="Изделия ручной работы", sort_order=1)
    card = make_card(owner, food, name="Основная карточка")
    for i in range(6):
        make_card(owner, food, name=f"Похожая карточка {i}", created_at=day(i))
    make_card(owner, food, name="Черновик в категории", status=CardStatus.draft)
    make_card(owner, crafts, name="Из другой категории")

    resp = client.get(f"/api/catalog/cards/{card.slug}/similar")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 5
    names = {c["name"] for c in items}
    assert card.name not in names
    assert "Из другой категории" not in names
    assert "Черновик в категории" not in names
    assert all(c["category_id"] == food.id for c in items)


def test_categories_count_published_only(client, make_user, make_category, make_card):
    owner, _ = make_user()
    food = make_category(name="Продукты")
    crafts = make_category(name="Изделия ручной работы", sort_order=1)
    make_card(owner, food, name="Опубликованная 1")
    make_card(owner, food, name="Опубликованная 2")
    make_card(owner, food, name="Черновик", status=CardStatus.draft)

    resp = client.get("/api/catalog/categories")
    assert resp.status_code == 200
    by_slug = {c["slug"]: c for c in resp.json()}
    assert by_slug[food.slug]["cards_count"] == 2
    assert by_slug[crafts.slug]["cards_count"] == 0


# ─── Slug rename resolution (R10 / KTD-5) ───

def test_rename_regenerates_slug_and_old_slug_resolves(
    client, db_session, make_user, make_category, make_card
):
    owner, token = make_user()
    cat = make_category()
    card = make_card(owner, cat, name="Старое название", status=CardStatus.draft)
    card_id, old_slug = card.id, card.slug

    resp = client.patch(
        f"/api/cabinet/cards/{card_id}", json={"name": "Новое название"}, headers=auth(token)
    )
    assert resp.status_code == 200
    new_slug = resp.json()["slug"]
    assert new_slug != old_slug
    assert new_slug.endswith(f"-{card_id}")

    # publish (as the admin would) and hit the OLD slug: resolves via the id suffix
    db_session.query(Card).filter(Card.id == card_id).update({"status": CardStatus.published})
    db_session.commit()

    resp = client.get(f"/api/catalog/cards/{old_slug}")
    assert resp.status_code == 200
    assert resp.json()["id"] == card_id
    assert resp.json()["slug"] == new_slug  # canonical slug returned

    assert client.get(f"/api/catalog/cards/{new_slug}").status_code == 200


# ─── Cabinet: my cards ───

def test_cabinet_lists_own_cards_any_status(client, make_user, make_category, make_card):
    owner, token = make_user()
    other, _ = make_user(email="other@example.com")
    cat = make_category()
    make_card(owner, cat, name="Мой черновик", status=CardStatus.draft)
    make_card(owner, cat, name="Моя опубликованная", status=CardStatus.published)
    make_card(owner, cat, name="Моя на проверке", status=CardStatus.pending)
    make_card(other, cat, name="Чужая карточка", status=CardStatus.published)

    resp = client.get("/api/cabinet/cards", headers=auth(token))
    assert resp.status_code == 200
    names = {c["name"] for c in resp.json()}
    assert names == {"Мой черновик", "Моя опубликованная", "Моя на проверке"}

    resp = client.get("/api/cabinet/cards", params={"status": "draft"}, headers=auth(token))
    assert [c["name"] for c in resp.json()] == ["Мой черновик"]


def test_cabinet_cards_guest_401(client):
    assert client.get("/api/cabinet/cards").status_code == 401


# ─── Cabinet: create draft ───

def test_create_card_draft(client, make_user, make_category):
    owner, token = make_user(name="Владелец Карточки")
    cat = make_category(name="Продукты")
    resp = client.post(
        "/api/cabinet/cards",
        json={
            "name": "Новая сыроварня",
            "category_id": cat.id,
            "short_description": "Домашние сыры из свежего молока.",
            "city": "Майкоп",
            "lat": 44.6,
            "lng": 40.1,
            "products": [{"name": "Сыр", "price": "500 ₽"}],
        },
        headers=auth(token),
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["status"] == "draft"
    assert body["slug"] == f"novaya-syrovarnya-{body['id']}"
    assert body["category_name"] == "Продукты"
    assert body["owner_name"] == "Владелец Карточки"
    assert body["lat"] == 44.6
    assert [p["name"] for p in body["products"]] == ["Сыр"]
    assert body["photos"] == []
    assert body["is_featured"] is False


def test_create_card_validation(client, make_user, make_category):
    owner, token = make_user()
    cat = make_category()
    valid = {
        "name": "Нормальное имя",
        "category_id": cat.id,
        "short_description": "Достаточно длинное описание.",
    }

    resp = client.post("/api/cabinet/cards", json={**valid, "name": "X"}, headers=auth(token))
    assert resp.status_code == 400  # name < 2 chars

    resp = client.post(
        "/api/cabinet/cards", json={**valid, "short_description": "коротко"}, headers=auth(token)
    )
    assert resp.status_code == 400  # short_description < 10 chars

    resp = client.post(
        "/api/cabinet/cards", json={**valid, "category_id": 99999}, headers=auth(token)
    )
    assert resp.status_code == 400  # unknown category


def test_create_card_guest_401(client, make_user, make_category):
    _, _ = make_user()
    cat = make_category()
    resp = client.post(
        "/api/cabinet/cards",
        json={"name": "Имя", "category_id": cat.id, "short_description": "Описание достаточное."},
    )
    assert resp.status_code == 401


# ─── Cabinet: PATCH + binding rule (KTD-3) ───

def test_patch_updates_fields(client, make_user, make_category, make_card):
    owner, token = make_user()
    cat = make_category()
    card = make_card(owner, cat, name="Черновик", status=CardStatus.draft)

    resp = client.patch(
        f"/api/cabinet/cards/{card.id}",
        json={"full_description": "Первый абзац.\n\nВторой абзац.", "whatsapp": "+79990001122"},
        headers=auth(token),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["full_description"] == "Первый абзац.\n\nВторой абзац."  # newlines preserved
    assert body["whatsapp"] == "+79990001122"
    assert body["status"] == "draft"  # draft stays draft


def test_patch_published_goes_pending_and_leaves_public_site(
    client, make_user, make_category, make_card
):
    owner, token = make_user()
    cat = make_category()
    card = make_card(
        owner, cat, name="Опубликованная", status=CardStatus.published, admin_comment="Одобрено"
    )
    slug = card.slug

    assert client.get("/api/catalog/cards").json()["total"] == 1

    resp = client.patch(
        f"/api/cabinet/cards/{card.id}",
        json={"short_description": "Обновлённое краткое описание."},
        headers=auth(token),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "pending"
    assert body["admin_comment"] is None  # cleared

    # gone from the public list and 404 by slug until re-approved
    assert client.get("/api/catalog/cards").json() == {"items": [], "total": 0}
    assert client.get(f"/api/catalog/cards/{slug}").status_code == 404


def test_patch_products_replace_all(client, db_session, make_user, make_category, make_card):
    owner, token = make_user()
    cat = make_category()
    card = make_card(owner, cat, status=CardStatus.draft)
    db_session.add(CardProduct(card_id=card.id, name="Старый товар 1", sort_order=0))
    db_session.add(CardProduct(card_id=card.id, name="Старый товар 2", sort_order=1))
    db_session.commit()

    resp = client.patch(
        f"/api/cabinet/cards/{card.id}",
        json={"products": [{"name": "Новый товар", "price": "700 ₽", "description": "Свежий"}]},
        headers=auth(token),
    )
    assert resp.status_code == 200
    products = resp.json()["products"]
    assert [p["name"] for p in products] == ["Новый товар"]
    assert products[0]["price"] == "700 ₽"
    assert db_session.query(CardProduct).filter(CardProduct.card_id == card.id).count() == 1

    # empty array wipes all products
    resp = client.patch(
        f"/api/cabinet/cards/{card.id}", json={"products": []}, headers=auth(token)
    )
    assert resp.json()["products"] == []


def test_patch_foreign_card_403(client, make_user, make_category, make_card):
    owner, _ = make_user()
    _, stranger_token = make_user(email="stranger@example.com")
    cat = make_category()
    card = make_card(owner, cat, status=CardStatus.draft)

    resp = client.patch(
        f"/api/cabinet/cards/{card.id}", json={"name": "Взломано"}, headers=auth(stranger_token)
    )
    assert resp.status_code == 403


def test_patch_missing_card_404_and_guest_401(client, make_user):
    _, token = make_user()
    assert (
        client.patch("/api/cabinet/cards/99999", json={"name": "Имя"}, headers=auth(token)).status_code
        == 404
    )
    assert client.patch("/api/cabinet/cards/1", json={"name": "Имя"}).status_code == 401


# ─── Cabinet: submit transitions (KTD-3) ───

def test_submit_transitions_to_pending(client, make_user, make_category, make_card):
    owner, token = make_user()
    cat = make_category()
    for i, status in enumerate((CardStatus.draft, CardStatus.needs_revision, CardStatus.rejected)):
        card = make_card(
            owner,
            cat,
            name=f"Карточка для подачи {i}",
            status=status,
            admin_comment="Исправьте описание" if status != CardStatus.draft else None,
        )
        resp = client.post(f"/api/cabinet/cards/{card.id}/submit", headers=auth(token))
        assert resp.status_code == 200, f"submit from {status.value}: {resp.text}"
        assert resp.json()["status"] == "pending"
        assert resp.json()["admin_comment"] is None


def test_submit_conflicts_409(client, make_user, make_category, make_card):
    owner, token = make_user()
    cat = make_category()
    pending = make_card(owner, cat, name="Уже на проверке", status=CardStatus.pending)
    published = make_card(owner, cat, name="Уже опубликована", status=CardStatus.published)

    assert client.post(f"/api/cabinet/cards/{pending.id}/submit", headers=auth(token)).status_code == 409
    assert (
        client.post(f"/api/cabinet/cards/{published.id}/submit", headers=auth(token)).status_code == 409
    )


def test_submit_foreign_403_guest_401(client, make_user, make_category, make_card):
    owner, _ = make_user()
    _, stranger_token = make_user(email="stranger@example.com")
    cat = make_category()
    card = make_card(owner, cat, status=CardStatus.draft)

    assert (
        client.post(f"/api/cabinet/cards/{card.id}/submit", headers=auth(stranger_token)).status_code
        == 403
    )
    assert client.post(f"/api/cabinet/cards/{card.id}/submit").status_code == 401


# ─── Cabinet: delete ───

def test_delete_card(client, db_session, make_user, make_category, make_card):
    owner, token = make_user()
    cat = make_category()
    card = make_card(owner, cat, status=CardStatus.draft)
    card_id = card.id

    resp = client.delete(f"/api/cabinet/cards/{card_id}", headers=auth(token))
    assert resp.status_code == 204
    assert db_session.query(Card).filter(Card.id == card_id).first() is None
    assert client.get("/api/cabinet/cards", headers=auth(token)).json() == []


def test_delete_foreign_403(client, make_user, make_category, make_card):
    owner, _ = make_user()
    _, stranger_token = make_user(email="stranger@example.com")
    cat = make_category()
    card = make_card(owner, cat)
    assert client.delete(f"/api/cabinet/cards/{card.id}", headers=auth(stranger_token)).status_code == 403


# ─── Cabinet: profile ───

def test_profile_patch(client, make_user):
    user, token = make_user(name="Старое Имя")
    resp = client.patch(
        "/api/cabinet/profile",
        json={"name": "Новое Имя", "phone": "+7 (900) 111-22-33", "city": "Нальчик", "country": "Россия"},
        headers=auth(token),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Новое Имя"
    assert body["phone"] == "+7 (900) 111-22-33"
    assert body["city"] == "Нальчик"
    assert body["country"] == "Россия"

    # partial update leaves other fields alone; empty string clears a field
    resp = client.patch("/api/cabinet/profile", json={"phone": ""}, headers=auth(token))
    assert resp.json()["phone"] is None
    assert resp.json()["name"] == "Новое Имя"

    assert client.patch("/api/cabinet/profile", json={"name": ""}, headers=auth(token)).status_code == 400
    assert client.patch("/api/cabinet/profile", json={"name": "Гость"}).status_code == 401

"""U6 tests: admin/moderation API — the KTD-3 admin-side state machine, moderation
events + activity feed, stats, users, categories CRUD, and events (афиша) CRUD."""
import datetime

import pytest

from app.models import (
    Card,
    CardStatus,
    Category,
    Event,
    EventStatus,
    ModerationEvent,
    User,
    UserRole,
)


def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_user(make_user):
    return make_user(email="admin@example.com", name="Администратор", role=UserRole.admin)


# ─── Access control: every /admin/* behind require_admin ───

ADMIN_ENDPOINTS = [
    ("GET", "/api/admin/stats"),
    ("GET", "/api/admin/activity"),
    ("GET", "/api/admin/cards"),
    ("POST", "/api/admin/cards/1/approve"),
    ("POST", "/api/admin/cards/1/reject"),
    ("POST", "/api/admin/cards/1/needs-revision"),
    ("POST", "/api/admin/cards/1/hide"),
    ("POST", "/api/admin/cards/1/show"),
    ("PATCH", "/api/admin/cards/1"),
    ("GET", "/api/admin/users"),
    ("POST", "/api/admin/categories"),
    ("PATCH", "/api/admin/categories/1"),
    ("DELETE", "/api/admin/categories/1"),
    ("GET", "/api/admin/events"),
    ("POST", "/api/admin/events"),
    ("PATCH", "/api/admin/events/1"),
    ("DELETE", "/api/admin/events/1"),
]


@pytest.mark.parametrize("method,url", ADMIN_ENDPOINTS)
def test_admin_endpoints_reject_guests_and_entrepreneurs(client, make_user, method, url):
    _, entrepreneur_token = make_user(email="entr@example.com")
    assert client.request(method, url).status_code == 401
    assert client.request(method, url, headers=auth(entrepreneur_token)).status_code == 403


# ─── §18.3: pending -> approve -> published, visible to guests ───

def test_approve_pending_card_publishes_it(client, make_user, make_category, make_card, admin_user):
    owner, _ = make_user()
    _, admin_token = admin_user
    cat = make_category()
    card = make_card(owner, cat, name="Карточка на проверке", status=CardStatus.pending,
                     admin_comment="старый комментарий")

    # invisible to guests while pending
    assert client.get("/api/catalog/cards").json()["total"] == 0

    resp = client.post(f"/api/admin/cards/{card.id}/approve", headers=auth(admin_token))
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "published"
    assert body["admin_comment"] is None  # approve clears the comment

    public = client.get("/api/catalog/cards").json()
    assert public["total"] == 1
    assert public["items"][0]["name"] == "Карточка на проверке"
    assert client.get(f"/api/catalog/cards/{card.slug}").status_code == 200


@pytest.mark.parametrize(
    "source", [CardStatus.needs_revision, CardStatus.rejected, CardStatus.hidden]
)
def test_approve_allowed_from_other_moderation_states(
    client, make_user, make_category, make_card, admin_user, source
):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=source)
    resp = client.post(f"/api/admin/cards/{card.id}/approve", headers=auth(admin_token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "published"


@pytest.mark.parametrize("source", [CardStatus.draft, CardStatus.published])
def test_approve_invalid_source_conflict(
    client, make_user, make_category, make_card, admin_user, source
):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=source)
    resp = client.post(f"/api/admin/cards/{card.id}/approve", headers=auth(admin_token))
    assert resp.status_code == 409


def test_moderation_actions_on_missing_card_404(client, admin_user):
    _, admin_token = admin_user
    assert client.post("/api/admin/cards/999/approve", headers=auth(admin_token)).status_code == 404


# ─── §9: reject / needs-revision require a comment ───

@pytest.mark.parametrize("action", ["reject", "needs-revision"])
@pytest.mark.parametrize("payload", [None, {}, {"comment": ""}, {"comment": "   "}])
def test_reject_and_revision_without_comment_422(
    client, make_user, make_category, make_card, admin_user, action, payload
):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=CardStatus.pending)
    resp = client.post(
        f"/api/admin/cards/{card.id}/{action}", headers=auth(admin_token), json=payload
    )
    assert resp.status_code == 422
    assert card.status == CardStatus.pending  # unchanged


def test_reject_with_comment_sets_admin_comment_visible_to_owner(
    client, make_user, make_category, make_card, admin_user
):
    owner, owner_token = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=CardStatus.pending)

    resp = client.post(
        f"/api/admin/cards/{card.id}/reject",
        headers=auth(admin_token),
        json={"comment": "Добавьте фотографии и контакты"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"
    assert resp.json()["admin_comment"] == "Добавьте фотографии и контакты"

    # the owner sees the comment in the cabinet
    mine = client.get("/api/cabinet/cards", headers=auth(owner_token)).json()
    assert mine[0]["status"] == "rejected"
    assert mine[0]["admin_comment"] == "Добавьте фотографии и контакты"


@pytest.mark.parametrize("action", ["reject", "needs-revision"])
@pytest.mark.parametrize(
    "source", [CardStatus.draft, CardStatus.published, CardStatus.hidden, CardStatus.rejected]
)
def test_reject_and_revision_only_from_pending(
    client, make_user, make_category, make_card, admin_user, action, source
):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=source)
    resp = client.post(
        f"/api/admin/cards/{card.id}/{action}",
        headers=auth(admin_token),
        json={"comment": "Комментарий"},
    )
    assert resp.status_code == 409


# ─── needs_revision -> owner edits -> submit -> pending again ───

def test_needs_revision_owner_edits_and_resubmits(
    client, make_user, make_category, make_card, admin_user
):
    owner, owner_token = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=CardStatus.pending)

    resp = client.post(
        f"/api/admin/cards/{card.id}/needs-revision",
        headers=auth(admin_token),
        json={"comment": "Уточните описание"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "needs_revision"

    # owner edits (status must stay needs_revision — only published edits go to pending)
    resp = client.patch(
        f"/api/cabinet/cards/{card.id}",
        headers=auth(owner_token),
        json={"short_description": "Обновлённое описание после доработки"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "needs_revision"

    resp = client.post(f"/api/cabinet/cards/{card.id}/submit", headers=auth(owner_token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"
    assert resp.json()["admin_comment"] is None


# ─── hide / show roundtrip incl. public visibility ───

def test_hide_show_roundtrip(client, make_user, make_category, make_card, admin_user):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), name="Опубликованная", status=CardStatus.published)
    assert client.get("/api/catalog/cards").json()["total"] == 1

    resp = client.post(f"/api/admin/cards/{card.id}/hide", headers=auth(admin_token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "hidden"
    assert client.get("/api/catalog/cards").json()["total"] == 0
    assert client.get(f"/api/catalog/cards/{card.slug}").status_code == 404

    resp = client.post(f"/api/admin/cards/{card.id}/show", headers=auth(admin_token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "published"
    assert client.get("/api/catalog/cards").json()["total"] == 1


def test_hide_show_invalid_sources_conflict(
    client, make_user, make_category, make_card, admin_user
):
    owner, _ = make_user()
    _, admin_token = admin_user
    pending = make_card(owner, make_category(), name="На проверке", status=CardStatus.pending)
    published = make_card(owner, make_category(), name="Опубликована", status=CardStatus.published)
    assert client.post(f"/api/admin/cards/{pending.id}/hide", headers=auth(admin_token)).status_code == 409
    assert client.post(f"/api/admin/cards/{published.id}/show", headers=auth(admin_token)).status_code == 409


# ─── Every moderation action writes a ModerationEvent; activity feed reads them ───

def test_full_lifecycle_writes_moderation_events_and_activity(
    client, db_session, make_user, make_category, admin_user
):
    owner, owner_token = make_user()
    admin, admin_token = admin_user
    cat = make_category()

    # owner creates + submits
    card_id = client.post(
        "/api/cabinet/cards",
        headers=auth(owner_token),
        json={
            "name": "Жизненный цикл",
            "category_id": cat.id,
            "short_description": "Карточка для сквозного теста модерации.",
        },
    ).json()["id"]
    client.post(f"/api/cabinet/cards/{card_id}/submit", headers=auth(owner_token))

    # needs-revision -> resubmit -> reject -> resubmit -> approve -> hide -> show
    assert client.post(f"/api/admin/cards/{card_id}/needs-revision",
                       headers=auth(admin_token), json={"comment": "Доработать"}).status_code == 200
    client.post(f"/api/cabinet/cards/{card_id}/submit", headers=auth(owner_token))
    assert client.post(f"/api/admin/cards/{card_id}/reject",
                       headers=auth(admin_token), json={"comment": "Отклонено"}).status_code == 200
    client.post(f"/api/cabinet/cards/{card_id}/submit", headers=auth(owner_token))
    assert client.post(f"/api/admin/cards/{card_id}/approve", headers=auth(admin_token)).status_code == 200
    assert client.post(f"/api/admin/cards/{card_id}/hide", headers=auth(admin_token)).status_code == 200
    assert client.post(f"/api/admin/cards/{card_id}/show", headers=auth(admin_token)).status_code == 200

    events = db_session.query(ModerationEvent).filter(ModerationEvent.card_id == card_id).all()
    assert sorted(e.action for e in events) == sorted(
        ["needs_revision", "reject", "approve", "hide", "show"]
    )
    assert all(e.admin_id == admin.id for e in events)
    by_action = {e.action: e for e in events}
    assert by_action["reject"].comment == "Отклонено"
    assert by_action["needs_revision"].comment == "Доработать"

    activity = client.get("/api/admin/activity", headers=auth(admin_token)).json()
    assert activity  # non-empty
    kinds = {item["kind"] for item in activity}
    assert {
        "card_approved", "card_rejected", "card_needs_revision",
        "card_hidden", "card_shown", "user_registered", "card_created",
    } <= kinds
    # sorted by created_at desc
    stamps = [item["created_at"] for item in activity]
    assert stamps == sorted(stamps, reverse=True)
    # Russian texts mention the card / user
    texts = " | ".join(item["text"] for item in activity)
    assert "Одобрена карточка «Жизненный цикл»" in texts
    assert "Зарегистрирован пользователь" in texts
    assert "Создана карточка «Жизненный цикл»" in texts


def test_activity_limited_to_30(client, make_user, make_category, make_card, admin_user):
    owner, _ = make_user()
    _, admin_token = admin_user
    cat = make_category()
    for i in range(35):
        make_card(owner, cat, name=f"Массовая карточка {i}", status=CardStatus.draft)
    activity = client.get("/api/admin/activity", headers=auth(admin_token)).json()
    assert len(activity) == 30


# ─── Admin PATCH: edit without status change ───

def test_admin_patch_edits_without_status_change(
    client, db_session, make_user, make_category, make_card, admin_user
):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), name="До правки", status=CardStatus.published)

    resp = client.patch(
        f"/api/admin/cards/{card.id}",
        headers=auth(admin_token),
        json={
            "name": "После правки админом",
            "short_description": "Новое краткое описание от админа.",
            "is_featured": True,
            "products": [{"name": "Товар от админа", "price": "500 ₽"}],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "published"  # no published->pending rule for admins
    assert body["name"] == "После правки админом"
    assert body["is_featured"] is True
    assert [p["name"] for p in body["products"]] == ["Товар от админа"]
    assert body["slug"].startswith("posle-pravki-adminom")  # slug follows renames

    # still publicly visible, no moderation event written for a plain edit
    assert client.get("/api/catalog/cards").json()["total"] == 1
    assert db_session.query(ModerationEvent).count() == 0


def test_admin_patch_pending_card_stays_pending(
    client, make_user, make_category, make_card, admin_user
):
    owner, _ = make_user()
    _, admin_token = admin_user
    card = make_card(owner, make_category(), status=CardStatus.pending)
    resp = client.patch(
        f"/api/admin/cards/{card.id}", headers=auth(admin_token), json={"is_featured": True}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"


# ─── GET /admin/cards: all owners, all statuses, ?status filter ───

def test_admin_cards_lists_all_owners_and_filters_by_status(
    client, make_user, make_category, make_card, admin_user
):
    owner1, _ = make_user(email="one@example.com")
    owner2, _ = make_user(email="two@example.com")
    _, admin_token = admin_user
    cat = make_category()
    make_card(owner1, cat, name="Черновик", status=CardStatus.draft)
    make_card(owner1, cat, name="На проверке", status=CardStatus.pending)
    make_card(owner2, cat, name="Опубликована", status=CardStatus.published)

    all_cards = client.get("/api/admin/cards", headers=auth(admin_token)).json()
    assert len(all_cards) == 3
    assert {c["owner_id"] for c in all_cards} == {owner1.id, owner2.id}

    assert len(client.get("/api/admin/cards?status=all", headers=auth(admin_token)).json()) == 3
    pending = client.get("/api/admin/cards?status=pending", headers=auth(admin_token)).json()
    assert [c["name"] for c in pending] == ["На проверке"]

    assert client.get("/api/admin/cards?status=bogus", headers=auth(admin_token)).status_code == 422


# ─── GET /admin/stats ───

def test_admin_stats_counts_and_deltas(
    client, db_session, make_user, make_category, make_card, admin_user
):
    owner, _ = make_user()
    _, admin_token = admin_user
    cat = make_category()
    month_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)

    make_card(owner, cat, name="Свежая на проверке", status=CardStatus.pending)
    make_card(owner, cat, name="Старая на проверке", status=CardStatus.pending, created_at=month_ago)
    make_card(owner, cat, name="Свежая опубликована", status=CardStatus.published)
    make_card(owner, cat, name="Старая опубликована", status=CardStatus.published, created_at=month_ago)
    make_card(owner, cat, name="Черновик", status=CardStatus.draft)

    db_session.add(User(name="Старый предприниматель", email="old@example.com",
                        role=UserRole.entrepreneur, created_at=month_ago))
    db_session.add(Event(title="Свежее событие", status=EventStatus.published))
    db_session.add(Event(title="Старое событие", status=EventStatus.draft, created_at=month_ago))
    db_session.commit()

    stats = client.get("/api/admin/stats", headers=auth(admin_token)).json()
    assert stats["pending_cards"] == 2
    assert stats["published_cards"] == 2
    assert stats["entrepreneurs"] == 2  # owner + old one; admin not counted
    assert stats["events"] == 2  # all statuses
    assert stats["pending_delta_7d"] == 1
    assert stats["published_delta_7d"] == 1
    assert stats["entrepreneurs_delta_7d"] == 1
    assert stats["events_delta_7d"] == 1


# ─── GET /admin/users ───

def test_admin_users_with_cards_count(client, make_user, make_category, make_card, admin_user):
    owner, _ = make_user()
    empty, _ = make_user(email="empty@example.com", name="Без карточек")
    _, admin_token = admin_user
    cat = make_category()
    make_card(owner, cat, name="Первая")
    make_card(owner, cat, name="Вторая", status=CardStatus.draft)

    users = client.get("/api/admin/users", headers=auth(admin_token)).json()
    by_id = {u["id"]: u for u in users}
    assert by_id[owner.id]["cards_count"] == 2
    assert by_id[empty.id]["cards_count"] == 0
    assert by_id[owner.id]["email"] == "owner@example.com"


# ─── Categories CRUD ───

def test_category_create_auto_slug_and_duplicate_409(client, admin_user):
    _, admin_token = admin_user
    resp = client.post(
        "/api/admin/categories", headers=auth(admin_token), json={"name": "Новая категория"}
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["slug"] == "novaya-kategoriya"
    assert body["cards_count"] == 0

    dup = client.post(
        "/api/admin/categories", headers=auth(admin_token), json={"name": "Новая категория"}
    )
    assert dup.status_code == 409

    empty = client.post("/api/admin/categories", headers=auth(admin_token), json={"name": "  "})
    assert empty.status_code == 400


def test_category_update_renames_and_reslugs(client, make_category, admin_user):
    _, admin_token = admin_user
    cat = make_category(name="Продукты")
    resp = client.patch(
        f"/api/admin/categories/{cat.id}",
        headers=auth(admin_token),
        json={"name": "Еда и напитки", "sort_order": 5},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Еда и напитки"
    assert body["slug"] == "eda-i-napitki"
    assert body["sort_order"] == 5


def test_category_delete_with_cards_409_empty_204(
    client, db_session, make_user, make_category, make_card, admin_user
):
    owner, _ = make_user()
    _, admin_token = admin_user
    busy = make_category(name="Занятая")
    empty = make_category(name="Пустая")
    make_card(owner, busy, name="Карточка в категории", status=CardStatus.draft)

    resp = client.delete(f"/api/admin/categories/{busy.id}", headers=auth(admin_token))
    assert resp.status_code == 409
    assert db_session.query(Category).filter(Category.id == busy.id).count() == 1

    resp = client.delete(f"/api/admin/categories/{empty.id}", headers=auth(admin_token))
    assert resp.status_code == 204
    assert db_session.query(Category).filter(Category.id == empty.id).count() == 0

    assert client.delete("/api/admin/categories/999", headers=auth(admin_token)).status_code == 404


# ─── Events (афиша) CRUD ───

def test_admin_events_lists_all_statuses(client, make_event, admin_user):
    _, admin_token = admin_user
    for status in (EventStatus.draft, EventStatus.published, EventStatus.hidden, EventStatus.finished):
        make_event(title=f"Событие {status.value}", status=status)
    events = client.get("/api/admin/events", headers=auth(admin_token)).json()
    assert {e["status"] for e in events} == {"draft", "published", "hidden", "finished"}


def test_admin_event_create_defaults_and_full(client, admin_user):
    _, admin_token = admin_user
    minimal = client.post(
        "/api/admin/events", headers=auth(admin_token), json={"title": "Минимальное событие"}
    )
    assert minimal.status_code == 201
    body = minimal.json()
    assert body["status"] == "draft"
    assert body["type"] == "event"
    assert body["is_featured"] is False
    assert body["date_start"] is None

    full = client.post(
        "/api/admin/events",
        headers=auth(admin_token),
        json={
            "title": "Фестиваль сыра",
            "type": "promo",
            "image_url": "https://example.com/img.jpg",
            "date_start": "2026-08-01",
            "date_end": "2026-08-02",
            "location": "Майкоп",
            "description": "Большой фестиваль.",
            "link": "https://example.com",
            "status": "published",
            "is_featured": True,
        },
    )
    assert full.status_code == 201
    body = full.json()
    assert body["date_start"] == "2026-08-01"
    assert body["status"] == "published"
    assert body["is_featured"] is True

    # validation errors
    assert client.post("/api/admin/events", headers=auth(admin_token), json={}).status_code == 422
    assert client.post("/api/admin/events", headers=auth(admin_token),
                       json={"title": " "}).status_code == 400
    assert client.post("/api/admin/events", headers=auth(admin_token),
                       json={"title": "X" * 3, "status": "bogus"}).status_code == 422


def test_admin_event_update_and_delete(client, db_session, make_event, admin_user):
    _, admin_token = admin_user
    event = make_event(title="Черновик события", status=EventStatus.draft,
                       date_start=datetime.date(2026, 8, 1), date_end=datetime.date(2026, 8, 2))

    resp = client.patch(
        f"/api/admin/events/{event.id}",
        headers=auth(admin_token),
        json={"status": "published", "is_featured": True, "date_end": None},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "published"
    assert body["is_featured"] is True
    assert body["date_end"] is None
    assert body["date_start"] == "2026-08-01"

    assert client.delete(f"/api/admin/events/{event.id}", headers=auth(admin_token)).status_code == 204
    assert db_session.query(Event).count() == 0
    assert client.patch("/api/admin/events/999", headers=auth(admin_token),
                        json={"title": "Нет"}).status_code == 404
    assert client.delete("/api/admin/events/999", headers=auth(admin_token)).status_code == 404

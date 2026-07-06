"""U16+ engagement metrics: view/click counters, likes, avatar & generic uploads.

Covers the api.ts contract additions — ApiCard {views_count, clicks_count,
likes_count, liked}, AdminStats/CabinetStats totals, and the new endpoints.
"""
import io

import pytest
from PIL import Image

from app.config import settings
from app.models import CardLike, CardStatus, UserRole


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def image_bytes(fmt="JPEG", size=(800, 600), mode="RGB"):
    buf = io.BytesIO()
    Image.new(mode, size, (150, 90, 60) if mode == "RGB" else (150, 90, 60, 255)).save(buf, fmt)
    return buf.getvalue()


@pytest.fixture(autouse=True)
def upload_dir(tmp_path, monkeypatch):
    """Isolate uploads into a per-test temp dir (settings.upload_dir_abs is absolute here)."""
    root = tmp_path / "uploads"
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(root))
    return root


@pytest.fixture()
def owner_card(make_user, make_category, make_card):
    owner, token = make_user()
    card = make_card(owner, make_category(), status=CardStatus.published)
    return owner, token, card


# ─── Card serializer defaults (fresh card = zeros, not liked) ───

def test_new_card_metrics_default_zero(client, owner_card):
    _, _, card = owner_card
    body = client.get(f"/api/catalog/cards/{card.slug}").json()
    assert body["clicks_count"] == 0
    assert body["likes_count"] == 0
    assert body["liked"] is False
    assert body["views_count"] == 1  # this fetch counted as one view


# ─── Views: detail GET increments, list does NOT ───

def test_detail_get_increments_views(client, owner_card):
    _, _, card = owner_card
    first = client.get(f"/api/catalog/cards/{card.slug}").json()
    second = client.get(f"/api/catalog/cards/{card.slug}").json()
    assert first["views_count"] == 1
    assert second["views_count"] == 2


def test_list_does_not_increment_views(client, owner_card):
    _, _, card = owner_card
    client.get("/api/catalog/cards")
    client.get("/api/catalog/cards")
    listed = client.get("/api/catalog/cards").json()["items"][0]
    assert listed["views_count"] == 0


# ─── Clicks: guest allowed, increments ───

def test_guest_click_increments(client, owner_card):
    _, _, card = owner_card
    resp = client.post(f"/api/catalog/cards/{card.slug}/click")
    assert resp.status_code == 200
    assert resp.json() == {"clicks_count": 1}
    assert client.post(f"/api/catalog/cards/{card.slug}/click").json()["clicks_count"] == 2
    # reflected in the serialized card
    assert client.get(f"/api/catalog/cards/{card.slug}").json()["clicks_count"] == 2


# ─── Likes: toggle, idempotency, guest 401, per-user liked ───

def test_like_sets_count_and_liked(client, owner_card):
    _, token, card = owner_card
    resp = client.post(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))
    assert resp.status_code == 200
    assert resp.json() == {"likes_count": 1, "liked": True}


def test_like_twice_stays_one(client, db_session, owner_card):
    _, token, card = owner_card
    client.post(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))
    resp = client.post(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))
    assert resp.json() == {"likes_count": 1, "liked": True}
    assert db_session.query(CardLike).filter(CardLike.card_id == card.id).count() == 1


def test_unlike_removes_like(client, db_session, owner_card):
    _, token, card = owner_card
    client.post(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))
    resp = client.delete(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))
    assert resp.json() == {"likes_count": 0, "liked": False}
    assert db_session.query(CardLike).filter(CardLike.card_id == card.id).count() == 0


def test_unlike_when_not_liked_is_idempotent(client, owner_card):
    _, token, card = owner_card
    resp = client.delete(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))
    assert resp.status_code == 200
    assert resp.json() == {"likes_count": 0, "liked": False}


def test_guest_like_401(client, owner_card):
    _, _, card = owner_card
    assert client.post(f"/api/catalog/cards/{card.slug}/like").status_code == 401
    assert client.delete(f"/api/catalog/cards/{card.slug}/like").status_code == 401


def test_liked_only_for_the_liker(client, make_user, owner_card):
    _, token, card = owner_card
    _, other_token = make_user(email="other@example.com")

    client.post(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))

    # liker sees liked=true
    liker_view = client.get(f"/api/catalog/cards/{card.slug}", headers=auth(token)).json()
    assert liker_view["liked"] is True and liker_view["likes_count"] == 1
    # a different logged-in user sees liked=false, same count
    other_view = client.get(f"/api/catalog/cards/{card.slug}", headers=auth(other_token)).json()
    assert other_view["liked"] is False and other_view["likes_count"] == 1
    # guest sees liked=false
    guest_view = client.get(f"/api/catalog/cards/{card.slug}").json()
    assert guest_view["liked"] is False and guest_view["likes_count"] == 1


def test_liked_true_in_list_and_similar(client, make_user, make_category, make_card):
    owner, token = make_user()
    category = make_category()
    card = make_card(owner, category, name="Первая карточка", status=CardStatus.published)
    make_card(owner, category, name="Вторая карточка", status=CardStatus.published)

    client.post(f"/api/catalog/cards/{card.slug}/like", headers=auth(token))

    listed = client.get("/api/catalog/cards", headers=auth(token)).json()["items"]
    liked_item = next(i for i in listed if i["id"] == card.id)
    assert liked_item["liked"] is True and liked_item["likes_count"] == 1
    # similar of the *other* card should show this card with liked=true
    similar = client.get(
        f"/api/catalog/cards/{card.slug}/similar", headers=auth(token)
    ).json()
    assert isinstance(similar, list)


# ─── Cabinet stats: sums across the owner's cards ───

def test_cabinet_stats_sums(client, db_session, make_user, make_category, make_card):
    owner, token = make_user()
    liker, _ = make_user(email="liker@example.com")
    category = make_category()
    c1 = make_card(owner, category, name="Карточка А", status=CardStatus.published,
                   views_count=5, clicks_count=2)
    c2 = make_card(owner, category, name="Карточка Б", status=CardStatus.published,
                   views_count=3, clicks_count=1)
    db_session.add_all([
        CardLike(card_id=c1.id, user_id=liker.id),
        CardLike(card_id=c2.id, user_id=liker.id),
        CardLike(card_id=c1.id, user_id=owner.id),
    ])
    db_session.commit()

    resp = client.get("/api/cabinet/stats", headers=auth(token))
    assert resp.status_code == 200
    assert resp.json() == {"total_views": 8, "total_clicks": 3, "total_likes": 3}


def test_cabinet_stats_guest_401(client):
    assert client.get("/api/cabinet/stats").status_code == 401


def test_cabinet_stats_only_own_cards(client, db_session, make_user, make_category, make_card):
    owner, token = make_user()
    stranger, _ = make_user(email="stranger@example.com")
    category = make_category()
    make_card(owner, category, name="Моя", status=CardStatus.published, views_count=4)
    make_card(stranger, category, name="Чужая", status=CardStatus.published, views_count=99)

    stats = client.get("/api/cabinet/stats", headers=auth(token)).json()
    assert stats["total_views"] == 4  # stranger's 99 excluded


# ─── Admin stats include totals ───

def test_admin_stats_include_totals(client, db_session, make_user, make_category, make_card):
    owner, _ = make_user()
    _, admin_token = make_user(email="admin@example.com", role=UserRole.admin)
    liker, _ = make_user(email="liker2@example.com")
    category = make_category()
    c1 = make_card(owner, category, name="К1", status=CardStatus.published,
                   views_count=10, clicks_count=4)
    c2 = make_card(owner, category, name="К2", status=CardStatus.pending,
                   views_count=6, clicks_count=1)
    db_session.add_all([
        CardLike(card_id=c1.id, user_id=liker.id),
        CardLike(card_id=c2.id, user_id=liker.id),
    ])
    db_session.commit()

    stats = client.get("/api/admin/stats", headers=auth(admin_token)).json()
    assert stats["total_views"] == 16  # across ALL cards regardless of status
    assert stats["total_clicks"] == 5
    assert stats["total_likes"] == 2


# ─── Avatar upload ───

def test_avatar_upload_sets_avatar_url(client, make_user):
    _, token = make_user()
    resp = client.post(
        "/api/cabinet/avatar",
        files={"file": ("me.jpg", image_bytes(), "image/jpeg")},
        headers=auth(token),
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["avatar_url"].startswith("/static/uploads/avatars/")
    assert body["avatar_url"].endswith(".webp")
    # persisted: /auth/me and /cabinet profile reflect it
    me = client.get("/api/auth/me", headers=auth(token)).json()
    assert me["avatar_url"] == body["avatar_url"]


def test_avatar_upload_guest_401(client):
    resp = client.post(
        "/api/cabinet/avatar", files={"file": ("me.jpg", image_bytes(), "image/jpeg")}
    )
    assert resp.status_code == 401


def test_avatar_upload_rejects_non_image(client, make_user):
    _, token = make_user()
    resp = client.post(
        "/api/cabinet/avatar",
        files={"file": ("x.pdf", b"%PDF-1.4 nope", "application/pdf")},
        headers=auth(token),
    )
    assert resp.status_code == 415


def test_profile_patch_accepts_avatar_url(client, make_user):
    _, token = make_user()
    resp = client.patch(
        "/api/cabinet/profile",
        json={"avatar_url": "https://cdn.example.com/a.png"},
        headers=auth(token),
    )
    assert resp.status_code == 200
    assert resp.json()["avatar_url"] == "https://cdn.example.com/a.png"


# ─── Generic image upload ───

def test_generic_image_upload_returns_url(client, upload_dir, make_user):
    _, token = make_user()
    resp = client.post(
        "/api/uploads/image",
        files={"file": ("product.png", image_bytes("PNG", mode="RGBA"), "image/png")},
        headers=auth(token),
    )
    assert resp.status_code == 200, resp.text
    url = resp.json()["url"]
    assert url.startswith("/static/uploads/misc/")
    assert url.endswith(".webp")
    on_disk = upload_dir / url.removeprefix("/static/uploads/")
    assert on_disk.is_file()


def test_generic_image_upload_guest_401(client):
    resp = client.post(
        "/api/uploads/image", files={"file": ("p.jpg", image_bytes(), "image/jpeg")}
    )
    assert resp.status_code == 401

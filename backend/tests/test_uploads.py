"""U4 tests: photo upload validation (type/size/limit/rights), Pillow processing
(webp + thumb on disk), photo deletion, and file cleanup on card delete."""
import io
import os

import pytest
from PIL import Image

from app.config import settings
from app.models import CardPhoto, CardStatus, UserRole


def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(autouse=True)
def upload_dir(tmp_path, monkeypatch):
    """Isolate uploads into a per-test temp dir (settings.UPLOAD_DIR is absolute here)."""
    root = tmp_path / "uploads"
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(root))
    return root


@pytest.fixture()
def owner_card(make_user, make_category, make_card):
    owner, token = make_user()
    card = make_card(owner, make_category(), status=CardStatus.draft)
    return owner, token, card


def image_bytes(fmt="JPEG", size=(2400, 1600), mode="RGB"):
    buf = io.BytesIO()
    Image.new(mode, size, (150, 90, 60) if mode == "RGB" else (150, 90, 60, 255)).save(buf, fmt)
    return buf.getvalue()


def upload(client, token, card_id, content, filename="photo.jpg", mime="image/jpeg"):
    return client.post(
        f"/api/cabinet/cards/{card_id}/photos",
        files={"file": (filename, content, mime)},
        headers=auth(token),
    )


def disk_path(upload_dir, url):
    return upload_dir / url.removeprefix("/static/uploads/")


# ─── Happy path ───

def test_upload_jpeg_happy_path(client, db_session, upload_dir, owner_card):
    _, token, card = owner_card
    resp = upload(client, token, card.id, image_bytes(size=(3000, 2000)))
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["url"].startswith(f"/static/uploads/{card.id}/")
    assert body["url"].endswith(".webp")
    assert body["thumb_url"].endswith("_thumb.webp")
    assert body["sort_order"] == 0

    main_path = disk_path(upload_dir, body["url"])
    thumb_path = disk_path(upload_dir, body["thumb_url"])
    assert main_path.is_file() and thumb_path.is_file()

    with Image.open(main_path) as img:
        assert img.format == "WEBP"
        assert max(img.size) == 1600  # longest side resized down to 1600
        assert img.size == (1600, 1067)  # aspect ratio kept
    with Image.open(thumb_path) as img:
        assert img.format == "WEBP"
        assert max(img.size) == 400

    # photo row persisted and visible in the card payload
    assert db_session.query(CardPhoto).filter(CardPhoto.card_id == card.id).count() == 1
    cards = client.get("/api/cabinet/cards", headers=auth(token)).json()
    assert cards[0]["photos"][0]["url"] == body["url"]


def test_upload_png_and_webp_accepted(client, upload_dir, owner_card):
    _, token, card = owner_card
    resp = upload(
        client, token, card.id, image_bytes("PNG", mode="RGBA"), filename="p.png", mime="image/png"
    )
    assert resp.status_code == 201, resp.text
    resp = upload(
        client, token, card.id, image_bytes("WEBP"), filename="p.webp", mime="image/webp"
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["sort_order"] == 1


def test_upload_small_image_not_upscaled(client, upload_dir, owner_card):
    _, token, card = owner_card
    resp = upload(client, token, card.id, image_bytes(size=(800, 500)))
    assert resp.status_code == 201
    with Image.open(disk_path(upload_dir, resp.json()["url"])) as img:
        assert img.size == (800, 500)  # never upscaled


# ─── Validation errors ───

def test_upload_pdf_415(client, owner_card):
    _, token, card = owner_card
    resp = upload(
        client, token, card.id, b"%PDF-1.4 not an image", filename="doc.pdf", mime="application/pdf"
    )
    assert resp.status_code == 415


def test_upload_fake_image_bytes_415(client, owner_card):
    _, token, card = owner_card
    # correct mime, garbage bytes: magic-byte check (Pillow verify) rejects it
    resp = upload(client, token, card.id, b"\x00\x01garbage-not-an-image")
    assert resp.status_code == 415


def test_upload_oversize_413(client, owner_card):
    _, token, card = owner_card
    resp = upload(client, token, card.id, b"\xff" * (5 * 1024 * 1024 + 1))
    assert resp.status_code == 413


def test_upload_11th_photo_409(client, db_session, owner_card):
    _, token, card = owner_card
    for i in range(10):
        db_session.add(
            CardPhoto(card_id=card.id, url=f"https://example.com/{i}.jpg", sort_order=i)
        )
    db_session.commit()

    resp = upload(client, token, card.id, image_bytes())
    assert resp.status_code == 409
    assert db_session.query(CardPhoto).filter(CardPhoto.card_id == card.id).count() == 10


# ─── Access control ───

def test_upload_foreign_card_403(client, make_user, owner_card):
    _, _, card = owner_card
    _, stranger_token = make_user(email="stranger@example.com")
    assert upload(client, stranger_token, card.id, image_bytes()).status_code == 403


def test_upload_guest_401(client, owner_card):
    _, _, card = owner_card
    resp = client.post(
        f"/api/cabinet/cards/{card.id}/photos",
        files={"file": ("photo.jpg", image_bytes(), "image/jpeg")},
    )
    assert resp.status_code == 401


def test_upload_missing_card_404(client, make_user):
    _, token = make_user()
    assert upload(client, token, 99999, image_bytes()).status_code == 404


def test_admin_can_upload_to_any_card(client, make_user, owner_card):
    _, _, card = owner_card
    _, admin_token = make_user(email="admin@example.com", role=UserRole.admin)
    assert upload(client, admin_token, card.id, image_bytes()).status_code == 201


# ─── Deletion ───

def test_delete_photo_removes_files_and_row(client, db_session, upload_dir, owner_card):
    _, token, card = owner_card
    body = upload(client, token, card.id, image_bytes()).json()
    main_path = disk_path(upload_dir, body["url"])
    thumb_path = disk_path(upload_dir, body["thumb_url"])
    assert main_path.is_file() and thumb_path.is_file()

    resp = client.delete(f"/api/cabinet/cards/{card.id}/photos/{body['id']}", headers=auth(token))
    assert resp.status_code == 204
    assert not main_path.exists()
    assert not thumb_path.exists()
    assert db_session.query(CardPhoto).filter(CardPhoto.card_id == card.id).count() == 0


def test_delete_photo_external_url_row_only(client, db_session, owner_card):
    """Seed photos keep external Unsplash URLs; deleting them must not touch the disk."""
    _, token, card = owner_card
    photo = CardPhoto(card_id=card.id, url="https://images.unsplash.com/x.jpg", sort_order=0)
    db_session.add(photo)
    db_session.commit()

    resp = client.delete(f"/api/cabinet/cards/{card.id}/photos/{photo.id}", headers=auth(token))
    assert resp.status_code == 204
    assert db_session.query(CardPhoto).count() == 0


def test_delete_photo_of_another_card_404(client, db_session, make_user, make_category, make_card, owner_card):
    owner, token, card = owner_card
    other_card = make_card(owner, make_category(), name="Другая карточка", status=CardStatus.draft)
    photo = CardPhoto(card_id=other_card.id, url="https://example.com/x.jpg", sort_order=0)
    db_session.add(photo)
    db_session.commit()

    # photo id exists but belongs to another card: 404 under this card
    resp = client.delete(f"/api/cabinet/cards/{card.id}/photos/{photo.id}", headers=auth(token))
    assert resp.status_code == 404


def test_delete_photo_foreign_card_403(client, db_session, make_user, owner_card):
    _, _, card = owner_card
    _, stranger_token = make_user(email="stranger@example.com")
    photo = CardPhoto(card_id=card.id, url="https://example.com/x.jpg", sort_order=0)
    db_session.add(photo)
    db_session.commit()
    resp = client.delete(
        f"/api/cabinet/cards/{card.id}/photos/{photo.id}", headers=auth(stranger_token)
    )
    assert resp.status_code == 403


# ─── Integration: deleting a card wipes its upload dir ───

def test_delete_card_removes_files_from_disk(client, db_session, upload_dir, owner_card):
    _, token, card = owner_card
    card_id = card.id
    upload(client, token, card_id, image_bytes())
    upload(client, token, card_id, image_bytes("PNG", mode="RGBA"), filename="b.png", mime="image/png")
    card_dir = upload_dir / str(card_id)
    assert card_dir.is_dir() and len(list(card_dir.iterdir())) == 4  # 2 photos + 2 thumbs

    resp = client.delete(f"/api/cabinet/cards/{card_id}", headers=auth(token))
    assert resp.status_code == 204
    assert not card_dir.exists()
    assert db_session.query(CardPhoto).filter(CardPhoto.card_id == card_id).count() == 0

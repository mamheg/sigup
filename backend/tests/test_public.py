"""U7 tests: public афиша (published + finished only, featured filter, sorting)
and the SEO sitemap.xml (published card slugs, category links, lastmod)."""
import datetime

from app.config import settings
from app.models import CardStatus, EventStatus

BASE = settings.SITE_URL.rstrip("/")


# ─── Public events: statuses & sorting ───

def test_public_events_serve_published_and_finished_only(client, make_event):
    make_event(title="Опубликованное", status=EventStatus.published,
               date_start=datetime.date(2026, 6, 7))
    make_event(title="Завершённое", status=EventStatus.finished,
               date_start=datetime.date(2026, 5, 25))
    make_event(title="Черновик", status=EventStatus.draft,
               date_start=datetime.date(2026, 7, 1))
    make_event(title="Скрытое", status=EventStatus.hidden,
               date_start=datetime.date(2026, 7, 2))

    resp = client.get("/api/catalog/events")
    assert resp.status_code == 200
    events = resp.json()
    assert [e["title"] for e in events] == ["Опубликованное", "Завершённое"]
    assert {e["status"] for e in events} == {"published", "finished"}


def test_public_events_sorted_date_start_desc_nulls_last(client, make_event):
    newer = make_event(title="Позднее", date_start=datetime.date(2026, 6, 7))
    older = make_event(title="Раннее", date_start=datetime.date(2026, 5, 25))
    dateless = make_event(title="Без даты", date_start=None)

    events = client.get("/api/catalog/events").json()
    assert [e["id"] for e in events] == [newer.id, older.id, dateless.id]
    assert events[-1]["date_start"] is None


def test_public_events_featured_filter(client, make_event):
    featured = make_event(title="Закреплённое", status=EventStatus.published, is_featured=True)
    make_event(title="Обычное", status=EventStatus.published, is_featured=False)
    make_event(title="Закреплённое завершённое", status=EventStatus.finished, is_featured=True)
    make_event(title="Закреплённый черновик", status=EventStatus.draft, is_featured=True)

    events = client.get("/api/catalog/events", params={"featured": "true"}).json()
    assert [e["id"] for e in events] == [featured.id]  # featured AND published only

    # featured=false behaves like the plain public list
    assert len(client.get("/api/catalog/events", params={"featured": "false"}).json()) == 3


def test_public_event_detail(client, make_event):
    published = make_event(title="Открытое", status=EventStatus.published)
    finished = make_event(title="Прошедшее", status=EventStatus.finished)
    draft = make_event(title="Черновик", status=EventStatus.draft)
    hidden = make_event(title="Скрытое", status=EventStatus.hidden)

    resp = client.get(f"/api/catalog/events/{published.id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Открытое"
    assert client.get(f"/api/catalog/events/{finished.id}").status_code == 200
    assert client.get(f"/api/catalog/events/{draft.id}").status_code == 404
    assert client.get(f"/api/catalog/events/{hidden.id}").status_code == 404
    assert client.get("/api/catalog/events/99999").status_code == 404


def test_public_event_shape_matches_contract(client, make_event):
    event = make_event(
        title="Полное событие",
        status=EventStatus.published,
        image_url="https://example.com/img.jpg",
        date_start=datetime.date(2026, 8, 1),
        date_end=datetime.date(2026, 8, 2),
        location="Нальчик",
        description="Описание.",
        link="https://example.com",
        is_featured=True,
    )
    body = client.get(f"/api/catalog/events/{event.id}").json()
    assert body == {
        "id": event.id,
        "title": "Полное событие",
        "type": "event",
        "image_url": "https://example.com/img.jpg",
        "date_start": "2026-08-01",
        "date_end": "2026-08-02",
        "location": "Нальчик",
        "description": "Описание.",
        "link": "https://example.com",
        "status": "published",
        "is_featured": True,
    }


# ─── sitemap.xml ───

def test_sitemap_contains_published_excludes_hidden(
    client, make_user, make_category, make_card
):
    owner, _ = make_user()
    cat = make_category(name="Продукты")
    published = make_card(owner, cat, name="Сырная мастерская", status=CardStatus.published)
    hidden = make_card(owner, cat, name="Скрытый проект", status=CardStatus.hidden)
    draft = make_card(owner, cat, name="Черновой проект", status=CardStatus.draft)

    resp = client.get("/api/sitemap.xml")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/xml")
    xml = resp.text

    # static pages
    for path in ("/", "/catalog", "/afisha", "/about"):
        assert f"<loc>{BASE}{path}</loc>" in xml
    # category link
    assert f"<loc>{BASE}/catalog?cat={cat.slug}</loc>" in xml
    # published card with lastmod from updated_at
    assert f"<loc>{BASE}/catalog/{published.slug}</loc>" in xml
    assert f"<lastmod>{published.updated_at.date().isoformat()}</lastmod>" in xml
    # hidden/draft cards excluded
    assert hidden.slug not in xml
    assert draft.slug not in xml


def test_sitemap_served_at_root_too(client, make_user, make_category, make_card):
    owner, _ = make_user()
    card = make_card(owner, make_category(), name="Корневая проверка", status=CardStatus.published)
    resp = client.get("/sitemap.xml")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/xml")
    assert f"/catalog/{card.slug}</loc>" in resp.text

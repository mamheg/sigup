---
title: "feat: Page-centric entrepreneur cabinet + stats digit font"
type: feat
date: 2026-07-06
status: planned
depth: standard
plan_id: 2026-07-06-002
---

# feat: Page-centric entrepreneur cabinet + stats digit font

## Summary

Rework the entrepreneur cabinet so its mental model is **«моя страница»** (one
business page per person), not **«фабрика карточек»** (churn out cards). The
public data model stays untouched — a `Card` already *is* a business page. This
is a **frontend-only** reframe of `src/components/EntrepreneurCabinet.tsx`: lead
the overview with the page(s) as first-class objects, rename cabinet copy from
«карточка» → «страница», and de-emphasize the create-more-cards affordance.

Two small fixes ride along: the statistics numbers render in a serif display
font (Cormorant) whose «1» looks wrong — switch stat digits to the sans font;
and the plan records the answer to the user's question about whether the
views/likes mechanism works (it does — see Findings).

**Scope decision (confirmed with user):** pure cabinet reframe. No new
"products-inside-a-page" sub-entity, no `Business` entity, no backend/migration,
no changes to the public catalog, card detail, or admin moderation.

---

## Problem Frame

The cabinet today presents cards as a **list to grow**:

- The overview leads with a stats row counting cards, then a dense admin
  **table** of cards, with a prominent «Создать новую карточку» button and a
  bottom CTA «Добавляйте новые проекты».
- Sidebar reads «Обзор / Мои карточки / Создать карточку».
- All copy says «карточка» and «проекты».

The intended model: a person has **one page** (their business or a single
product); even a multi-project person thinks one-page-at-a-time, each page its
own space. The cabinet should make *the page itself* the hero — its preview,
its stats, edit/open actions — not a table that implies "make more".

### Findings (answers the user's direct questions)

- **Views/likes/clicks work end-to-end** (verified in code + live):
  - Views: `GET /catalog/cards/{slug}` increments `views_count` and commits
    (`backend/app/routers/catalog.py:114`).
  - Clicks: `POST /catalog/cards/{slug}/click` on «Связаться» (guests counted).
  - Likes: `POST/DELETE /catalog/cards/{slug}/like`, auth-required, idempotent,
    backed by the `card_likes` table; guests are redirected to login by
    `src/components/catalog/ProductCard.tsx`.
  - Aggregated in the cabinet overview (`cabinet.stats` sums) and admin dashboard.
  - **Caveat (not a bug):** views are counted raw on every open — no
    dedup and no owner-exclusion, so an owner refreshing their own page inflates
    the number. Treated as **deferred** (see Scope Boundaries), not part of this
    reframe.
- **Stats digit font:** big numbers use `font-serif` (Cormorant Garamond) whose
  lining/old-style «1» reads oddly next to `tabular`. Fix = use the sans font
  (`font-sans` / Inter) for stat **digits**. Present in
  `EntrepreneurCabinet.tsx` (values + engagement + completeness %) and
  `src/pages/admin/DashboardPage.tsx:266`.

---

## Requirements

- **R1** — The cabinet overview leads with the entrepreneur's **page(s)** as
  rich preview objects (cover, name, category, location, status, per-page
  engagement, actions), not with a stats-count row + admin table.
- **R2** — Single-page users (the common case) see one focused **«Моя страница»**
  panel; multi-page users see a **«Ваши страницы»** grid where each page is its
  own space. New users see a single clear "create your page" empty state.
- **R3** — Cabinet copy uses **«страница»** instead of «карточка» / «проект»
  (sidebar, section titles, CTAs, empty states, delete modal), plus the
  create/edit page headers the entrepreneur passes through.
- **R4** — Statistics **digits** render in the sans font (Inter), keeping
  `tabular` for alignment; no serif figures in stat values. Applies to the
  cabinet and the admin dashboard stat tiles for parity.
- **R5** — No change to the public data model, catalog, card detail, moderation,
  or any backend endpoint. Status tabs (draft/pending/published/rejected/
  needs_revision) and engagement metrics keep working exactly as today.

---

## Key Technical Decisions

- **Card stays the unit; "page" is a UI relabel only.** No model/API rename.
  `Card`, `api.cabinet.myCards()`, routes (`/cabinet`, `/cabinet/edit/:id`,
  `paths.create`) are unchanged. Only Russian UI copy and layout change. This
  keeps the reframe to one component and zero risk to the public site.
- **Terminology split is intentional and bounded.** «Страница» is used inside
  the entrepreneur's surfaces (cabinet + create/edit headers). The public
  catalog and admin keep «карточка» for now — aligning the whole product's
  vocabulary is deferred (Scope Boundaries), not silently half-done.
- **Layout branches on page count** (0 / 1 / many) rather than a single generic
  list — this is what encodes the "one page" accent. See High-Level Design.
- **Reuse existing pieces.** The page-preview panel reuses the same fields the
  `CardsTable` already reads (`photos`, `name`, `category_name`, `city`,
  `country`, `status`, `views_count`, `clicks_count`, `likes_count`,
  `updated_at`) and the existing status→tone/label helpers. No new API fields.
- **Font fix via utility swap.** Replace `font-serif` with `font-sans` on stat
  value elements only; leave serif on headings and avatar initials (letters,
  which render fine).

---

## High-Level Technical Design

Overview layout selected by number of pages (cards) the entrepreneur owns:

| Pages | Overview leads with | Primary actions | «Создать» affordance |
|------:|--------------------|-----------------|----------------------|
| **0** | Single empty-state hero: "Создайте свою страницу на SiGup" | one primary CTA | the CTA itself |
| **1** | One large **«Моя страница»** panel: cover + name/category/location + status + views/clicks/likes + [Редактировать] [Открыть на сайте] [Ссылка] | edit / open the page | secondary, small ("+ ещё одна страница") |
| **≥2** | **«Ваши страницы»** grid of page-preview cards, each its own space with its own mini-stats + edit/open | per-page edit / open | secondary in the section header |

Supporting sections (unchanged in intent, kept below the hero): moderation
notifications, account summary + profile completeness. The dense `CardsTable`
becomes the detail view under **«Мои страницы»** (with the existing status
tabs), no longer the overview's centerpiece.

```
Overview (1 page)                 Overview (≥2 pages)
┌───────────────────────────┐     ┌──────────┐ ┌──────────┐
│  МОЯ СТРАНИЦА              │     │ страница │ │ страница │
│  [cover]  Сырная мастер…  │     │ [cover]  │ │ [cover]  │
│           Продукты·Майкоп │     │ 👁124 ❤8 │ │ 👁40 ❤2 │
│           👁124 ❤8 🖱12   │     │ [ред][↗] │ │ [ред][↗] │
│  [Редактировать][Открыть] │     └──────────┘ └──────────┘
└───────────────────────────┘     + «Новая страница»
  Уведомления · Профиль            Уведомления · Профиль
```

*(Directional guidance for reviewers — not implementation specification.)*

---

## Scope Boundaries

**In scope**
- Restructure `EntrepreneurCabinet.tsx` overview to page-centric (R1–R2).
- Cabinet + create/edit copy «карточка» → «страница» (R3).
- Stats digit font fix in cabinet + admin dashboard (R4).

**Out of scope / non-goals**
- Public catalog, card detail page, map, moderation queue, and their «карточка»
  wording — unchanged (R5).
- Any backend, schema, migration, or API-shape change.

### Deferred to Follow-Up Work
- **Товары-позиции внутри страницы** (the "products inside a page" model — this
  was option 2 in the scoping question). Would need a backend sub-entity + a
  storefront section in the editor and on the public card page.
- **Views dedup / owner-exclusion** so `views_count` reflects distinct visitors
  rather than raw opens.
- **Product-wide terminology alignment** — renaming «карточка» → «страница» on
  the public catalog and admin surfaces for one consistent vocabulary.

---

## Implementation Units

### U1. Page-centric overview restructure

**Goal:** Make the cabinet overview lead with the entrepreneur's page(s) as rich
preview objects, branching on page count (0 / 1 / many), so the cabinet reads as
"this is your page" rather than "a list of cards to grow" (R1, R2).

**Requirements:** R1, R2, R5
**Dependencies:** none
**Files:**
- `src/components/EntrepreneurCabinet.tsx` (modify — overview section, new
  page-preview panel/grid subcomponent; reuse existing `all`, `engagement`,
  `counts`, `notifications`, status helpers)

**Approach:**
- Add a `PagePreview` presentational piece (same file) rendering one card as a
  page: cover (`photos[0]`), name, `category_name`, `city/country`, status
  badge, its own views/clicks/likes, and actions — [Редактировать]
  (`/cabinet/edit/{id}`), [Открыть на сайте] (`paths.project(slug)`, only when
  `published`), and a copy-link/[Ссылка] affordance for published pages.
- Overview branches by `all.length`: 0 → single empty-state hero with one CTA to
  `paths.create`; 1 → one large `PagePreview` as the hero; ≥2 → «Ваши страницы»
  responsive grid of `PagePreview` cards, each its own space, with a secondary
  "Новая страница" affordance in the section header.
- Keep the aggregate engagement block, moderation notifications, and account
  summary below the hero. The dense `CardsTable` is no longer the overview
  centerpiece — it remains reachable as the «Мои страницы» detail view (with the
  existing status tabs).
- Demote the bottom "create more" CTA band: for single/zero pages it may guide
  toward the first/next page; it must not dominate the single-page overview.

**Patterns to follow:** existing overview card/tile styling in this file
(`bg-surface border border-line rounded-md/-lg shadow-card`, `text-gold`
iconography), `statusTone` + `STATUS_EN_RU`, `Avatar`, `mediaUrl` for images,
`paths.project` / `paths.create`.

**Test scenarios** (this project has no component-test harness; verify via
Playwright against the running stack + `tsc`/build/style-guard, matching the
repo's existing E2E approach):
- Zero pages: overview shows a single "create your page" empty state and exactly
  one primary CTA to the create flow; no admin table.
- One page: overview leads with a single page panel showing cover, name,
  category, location, status badge, and that page's views/likes/clicks; edit and
  (if published) open-on-site actions navigate correctly.
- Two+ pages: a grid renders one preview per page, each with its own stats and
  edit/open actions; "Новая страница" is present but secondary.
- Published vs. draft page: open-on-site / link actions appear only for
  published pages; edit is always available.
- Engagement values shown per page match `views_count/likes_count/clicks_count`
  from `api.cabinet.myCards()`.

**Verification:** On `:4000`, an entrepreneur with 1 card sees a page-hero
overview (no dense table up top); with 0 cards sees the empty state; with ≥2 sees
the grid. No console errors; status tabs + metrics still function.

### U2. Card → page terminology and framing copy

**Goal:** Replace «карточка» / «проект» with «страница» across the entrepreneur's
surfaces so the language reinforces the one-page model (R3).

**Requirements:** R3
**Dependencies:** U1 (new overview copy lands consistently)
**Files:**
- `src/components/EntrepreneurCabinet.tsx` (modify — sidebar labels, section
  titles, CTAs, empty states, delete modal, greeting/intro copy)
- `src/components/CreateCardPage.tsx` (modify — page headings / button copy the
  entrepreneur sees: «карточка» → «страница», keep draft/submit semantics)

**Approach:**
- Sidebar: «Мои карточки» → «Мои страницы», «Создать карточку» → «Новая
  страница». Section title `FILTER_TITLES.all` and panel header follow.
- Intro/greeting and CTA band: «управлять своими проектами» / «Добавляйте новые
  проекты» → page-framed wording.
- Delete modal copy: «Карточка … будет удалена» → «Страница …».
- Create/edit headers reworded to «страница»; do **not** touch field-level labels
  that describe the card's public listing where «карточка» is not user-visible,
  and do **not** change route names, API calls, or `id`s used by tests/selectors.
- Leave status-tab labels (Черновики/На проверке/…) as-is — they describe
  moderation state, not the object noun.

**Patterns to follow:** existing label strings and `Chip`/`Button` usage in the
file; keep `id="cabinet-create-card-btn"` and row `id`s stable.

**Test expectation:** copy-only within the cabinet/create surfaces; verify no
selector/`id`/route churn via `tsc` + build + a Playwright pass that still finds
the create button and completes draft creation.

**Verification:** Cabinet and create/edit read «страница» throughout; public
catalog/admin still read «карточка»; existing E2E (draft create → submit) passes
unchanged.

### U3. Statistics digit font fix

**Goal:** Render statistics **digits** in the sans font (Inter) so figures like
«1» look normal, keeping tabular alignment (R4).

**Requirements:** R4
**Dependencies:** none (independent of U1/U2)
**Files:**
- `src/components/EntrepreneurCabinet.tsx` (modify — stat value at ~line 597,
  engagement value at ~line 613, completeness % at ~line 710)
- `src/pages/admin/DashboardPage.tsx` (modify — stat value at ~line 266, for
  parity)

**Approach:** Swap `font-serif` → `font-sans` on the numeric value elements only;
retain `tabular` and sizing. Do not change headings or avatar initials (letters
render fine in serif). If a new `PagePreview` (U1) shows per-page numbers, use
`font-sans tabular` there too.

**Patterns to follow:** the default body font is already Inter (`--font-sans`);
`tabular` utility stays.

**Test expectation:** none (pure styling, no behavioral change) — verify visually
that stat digits are sans and aligned, and `npm run lint:styles` stays green.

**Verification:** Cabinet overview and admin dashboard stat numbers display in
Inter; «1» matches the rest of the UI; style guard passes.

---

## Risks & Dependencies

- **Terminology split (cabinet «страница» vs. public «карточка»)** could read as
  inconsistent. Mitigation: bounded and intentional (KTD); full alignment is a
  named follow-up. Revisit if it confuses users.
- **Selector/E2E breakage** from copy changes. Mitigation: U2 explicitly keeps
  `id`s, routes, and API names stable; the Playwright acceptance pass is the
  guard.
- **Single-vs-multi layout regressions** on mobile. Mitigation: verify all three
  page-count states at mobile + desktop widths (U1 scenarios).

---

## Verification Strategy

This repo verifies frontend via `npx tsc --noEmit`, `npm run lint:styles`,
`VITE_API_URL=/api npm run build`, and Playwright checks against the Docker stack
on `:4000` (there is no component unit-test harness). For each unit, run those
four and drive the affected cabinet flows in Playwright at desktop (1280) and
mobile (390) widths, confirming zero console errors and that engagement metrics
and status tabs still work.

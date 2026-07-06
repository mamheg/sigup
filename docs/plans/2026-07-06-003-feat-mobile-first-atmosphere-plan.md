---
title: "feat: Mobile-first frontend rework + Circassian atmosphere"
type: feat
date: 2026-07-06
status: planned
depth: deep
plan_id: 2026-07-06-003
---

# feat: Mobile-first frontend rework + Circassian atmosphere

## Summary

A frontend-only pass driven by a real phone review: the site currently feels
like an unfinished mockup on mobile because the desktop layout is crammed into
small screens. Make **mobile the base layout** for the key screens (not a
squeezed desktop), remove the SiGup hero banner on phones, condense the footer,
stop the card-detail tabs from scrolling sideways, add the **missing event
detail page**, and give the flat background some **Circassian atmosphere**
(ornament/texture) — all without touching the color palette.

**Explicitly out of scope this round (user's instruction):** color/palette
changes (the accent hue, the "blue vs. greener" question) and any backend work.

**Execution posture:** run on a feature branch (`feat/mobile-first`) with
granular per-unit commits so any piece is easy to roll back in git. Do not merge
to `main` until the user reviews (they are away from a PC until Friday and will
check on their phone once it's deployed).

---

## Problem Frame

A phone-only review (relayed by the user) surfaced these frontend issues:

- **Desktop crammed into mobile.** Elements look "замкнуто, приплюснуто"
  (cramped/pinched); too much wasted vertical "air" in some places, too tight in
  others. The reviewer wants a mobile-first architecture (like the user's
  `brunchcoffee` project) that prioritizes catalog / account / cards.
- **Hero banner wastes space on mobile.** The big "SiGup — информационная
  площадка" hero should be removed on phones; start with header + catalog.
- **Footer is nearly half a screen on mobile** — should be condensed.
- **Card-detail characteristics tabs scroll left/right** on mobile, which "breaks
  the picture."
- **Afisha has no per-event page** — clicking an event does not open a dedicated
  event page (only an optional external link).
- **Flat, atmosphere-less background.** Wants light graphics / Circassian motifs
  so the page conveys "presence" / Circassian identity — without recoloring.

Confirmed via a survey with the user:
- Mobile depth → **dedicated mobile-first layout**, revertible via git.
- Hero on mobile → **remove**.
- Event page → **build it**.
- Extra fixes → **Circassian graphics/texture** selected.

---

## Requirements

- **R1** — On phones, the home page leads with content (compact search +
  categories + popular), not the hero banner. Desktop keeps the hero.
- **R2** — Key screens use a mobile-first layout: lean, appropriately dense
  spacing on small screens; desktop spacing restored at `sm:`/`lg:`.
- **R3** — The footer is materially shorter on mobile (condensed columns /
  reduced padding), while desktop stays as-is.
- **R4** — The card-detail tabs never require horizontal scrolling on mobile.
- **R5** — Clicking an event opens a dedicated event detail page at
  `/afisha/:id` with full event info; back returns to the afisha gallery.
- **R6** — Pages carry subtle Circassian ornament/texture for atmosphere, using
  the existing monochrome `ornament.svg` and current tokens — **no palette
  change**.
- **R7** — No backend, API, schema, or color-token changes; desktop layouts must
  not visually regress.

---

## Key Technical Decisions

- **Mobile-first via responsive utilities, not forked components.** Make the
  default (unprefixed) Tailwind classes the *mobile* design, then layer desktop
  with `sm:`/`md:`/`lg:`. This is how "write for phones, not cram PC down" is
  realized without a second component tree — keeping the diff small and
  revertible. Use `hidden sm:block` only where an element is dropped on mobile
  (the hero).
- **Event detail page is frontend-only.** There is no public single-event
  endpoint; the page fetches the existing public list (`api.catalog.events()`)
  and selects by `id`. No backend/endpoint/migration (honors "именно фронт").
- **Atmosphere reuses `public/ornament.svg`** (already used as the footer
  watermark and the hero's left band) at low opacity plus existing warm tokens.
  A single reusable ornament/texture layer is added and applied per screen — no
  new colors introduced.
- **Feature branch + granular commits.** One commit per unit on
  `feat/mobile-first`; rollback = revert a commit or drop the branch. Merge to
  `main` (which the server pulls) only after user review.
- **Desktop is a non-goal but a guardrail.** Every unit is verified at 1280px to
  confirm no desktop regression, since the user can only check mobile until
  Friday.

---

## High-Level Technical Design

Per-screen mobile-first changes (desktop unchanged unless noted):

| Screen | Mobile change | Mechanism |
|--------|---------------|-----------|
| Home (`MainPage`) | Drop hero; lead with compact search → categories → popular; tighten section rhythm | `hidden sm:block` on hero; mobile search block; reduced `py` on mobile |
| Footer | ~40–50% shorter: fewer columns, less padding, trimmed blocks | `grid-cols-2` on mobile, `py-10 sm:py-14`, condensed brand/help |
| Card detail | Tabs wrap instead of scroll; denser mobile padding | `flex-wrap` (drop `overflow-x-auto` on mobile); `p-5 sm:p-8` |
| Afisha | Event cards become links → new event page | `navigate('/afisha/:id')`; new route + page |
| Catalog / Cabinet | Reduce wasted air, fix pinched elements on mobile | per-screen spacing/rounding polish |
| All | Subtle ornament/texture background for atmosphere | reusable ornament layer at low opacity |

*(Directional guidance for reviewers — not implementation specification.)*

---

## Scope Boundaries

**In scope**
- Mobile-first rework of home, catalog, card detail, cabinet, afisha (R1–R4, R7).
- New event detail page (R5).
- Circassian ornament/texture atmosphere (R6).

**Out of scope / non-goals**
- **Color/palette changes** — the accent hue and "blue vs. greener" feedback are
  explicitly parked by the user for this round.
- Any backend, API, schema, or event-endpoint change.
- Desktop redesign — desktop stays visually as-is (guardrail only).

### Deferred to Follow-Up Work
- Accent-hue revisit (reviewer wants a greener tone that plays with the cream) —
  a separate color round when the user chooses to.
- A public single-event backend endpoint (only needed if the events list grows
  large enough that client-side selection is wasteful).
- Deeper mobile navigation/cabinet-discoverability work (not selected in the
  survey; the mobile header keeps account access as today).

### Assumptions (flagged for correction)
- Footer condense (R3) and card-detail tabs fix (R4) are included as part of the
  mobile-first pass even though they were not separately ticked in the survey's
  "extra fixes" list — they are the reviewer's named mobile complaints and fall
  naturally out of reworking those screens. Tell me to drop either if you'd
  rather defer it.

---

## Implementation Units

### U1. Mobile-first home — remove hero, lead with search + categories

**Goal:** On phones, drop the hero banner and open the home with a compact search
+ categories + popular carousel; tighten mobile section rhythm. Desktop keeps the
hero unchanged (R1, R2, R7).

**Requirements:** R1, R2, R7
**Dependencies:** none
**Files:** `src/components/MainPage.tsx`

**Approach:**
- Wrap the hero `<section>` so it is `hidden sm:block` (removed on mobile, intact
  on desktop).
- Add a mobile-only lead block above categories: a compact search field that
  routes to `/catalog?q=…` (the global header search was moved to catalog, so the
  home needs an entry point) plus a one-line greeting/kicker. `sm:hidden`.
- Reduce mobile vertical padding on the categories/popular sections (`pt-6 sm:pt-12`
  etc.) so the phone view starts dense and useful; keep desktop paddings.

**Patterns to follow:** existing category grid + `Carousel` in `MainPage`; the
catalog search field styling from `src/pages/CatalogPage.tsx`; `paths.catalog`.

**Test scenarios** (no component-test harness — verify with Playwright at 390px
and 1280px + `tsc`/`lint:styles`/build):
- 390px: hero is absent; first content is the compact search + categories; no
  horizontal scroll.
- Compact search submits → navigates to `/catalog?q=<text>`.
- 1280px: hero still renders exactly as before (no desktop regression).

**Verification:** Phone view opens on search+categories with less top air; desktop
hero unchanged; zero console errors.

### U2. Condense footer on mobile

**Goal:** Cut the footer's mobile height substantially while leaving desktop as-is
(R3, R7).

**Requirements:** R3, R7
**Dependencies:** none
**Files:** `src/components/Footer.tsx`

**Approach:**
- Reduce outer padding on mobile: `py-10 sm:py-14` (from `py-14`), divider
  `mt-8 pt-6 sm:mt-12 sm:pt-8`.
- Collapse the 4-column grid to a tighter 2-column mobile layout
  (`grid-cols-2 sm:grid-cols-2 lg:grid-cols-4`) with smaller `gap` on mobile.
- Trim the brand blurb / long lists on mobile (e.g., clamp the description,
  smaller social row spacing) so the block is ~40–50% shorter. Keep all links.

**Patterns to follow:** existing footer markup and tokens; keep footer link `id`s
(`footer-telegram-link`, etc.) stable.

**Test scenarios:**
- 390px: measured footer height is materially lower than before (target ≥ ~35%
  reduction); all nav/help/social links still present and tappable.
- 1280px: footer visually unchanged.

**Verification:** Footer no longer reads as "half the screen" on mobile; desktop
identical; links intact.

### U3. Card detail — tabs without horizontal scroll + mobile density

**Goal:** The characteristics tabs wrap instead of scrolling sideways on mobile,
and the detail content is comfortably dense on phones (R4, R2).

**Requirements:** R4, R2, R7
**Dependencies:** none
**Files:** `src/components/CardDetailPage.tsx`

**Approach:**
- Replace the tab strip `flex overflow-x-auto scrollbar-none` with a wrapping bar
  on mobile (`flex flex-wrap` / equal-width tabs), keeping the single-row look at
  `sm:` where it fits. No horizontal scrolling on any width.
- Reduce mobile padding on the tab panel and gallery blocks (`p-5 sm:p-8`), and
  verify the gallery/action rows don't pinch on 390px.

**Patterns to follow:** the existing tab button styling; `TAB_LABELS`; keep tab
keys/behavior unchanged.

**Test scenarios:**
- 390px with all 4 tabs (about/products/delivery/contacts): the tab bar shows
  every tab without a horizontal scrollbar; tapping switches panels.
- 1280px: tabs remain a single tidy row.
- No horizontal page scroll on the detail page at 390px.

**Verification:** No sideways tab scrolling on mobile; content reads dense but not
pinched; desktop unchanged.

### U4. Event detail page (`/afisha/:id`)

**Goal:** Clicking an event opens a dedicated, mobile-first event page with full
info; back returns to the gallery (R5).

**Requirements:** R5, R2, R7
**Dependencies:** none
**Files:**
- `src/pages/EventDetailPage.tsx` (create)
- `src/routes.tsx` (add `{ path: "afisha/:id", element: <EventDetailРoutе/> }`)
- `src/pages/AfishaPage.tsx` (make `EventCard` navigate to the event page)
- `src/lib/paths.ts` (add an `event(id)` path helper, mirroring `project`)

**Approach:**
- New page fetches `api.catalog.events()`, finds the event by `:id` (client-side
  select — no backend). Loading skeleton + not-found fallback (back to afisha).
- Layout mobile-first: full-width cover image, type badge, title, date, location,
  full/short description (use the richest field available on the event; fall back
  to `shortDescription` when no long text), external "Подробнее"/link button, and
  location text (map only if the event carries coordinates — otherwise omit).
- `EventCard` (afisha) becomes clickable → `navigate(paths.event(e.id))`; keep the
  optional external link as a secondary action.

**Patterns to follow:** `DetailRoute`/route-wrapper pattern in `src/routes.tsx`;
`CardDetailPage` structure for a detail layout; `apiEventToEventItem` mapper and
`EventItem` type for available fields.

**Test scenarios:**
- From `/afisha`, tapping an event navigates to `/afisha/:id` and shows its title,
  image, date, location, and description.
- Unknown id → graceful "событие не найдено" with a link back to afisha.
- Back navigation returns to the gallery.
- 390px and 1280px both render without horizontal scroll.

**Verification:** Every event opens its own page with full details on mobile and
desktop; no backend calls beyond the existing events list.

### U5. Circassian ornament/texture atmosphere

**Goal:** Give the flat background subtle Circassian character (ornament/texture)
for "presence," using existing assets and tokens — no color change (R6, R7).

**Requirements:** R6, R7
**Dependencies:** none (apply after U1/U4 so new surfaces are covered)
**Files:**
- `src/index.css` (a reusable low-opacity ornament/texture utility, e.g.
  `.ornament-bg` / `.ornament-edge`)
- `src/components/MainPage.tsx`, `src/pages/AfishaPage.tsx`,
  `src/pages/EventDetailPage.tsx`, `src/components/EntrepreneurCabinet.tsx`
  (apply the atmosphere layer to section headers / page tops)

**Approach:**
- Add a reusable background utility using `url('/ornament.svg')` tiling at low
  opacity (~0.04–0.08) so it reads as texture, not noise, on the cream canvas.
- Apply as: a faint page-top or section-header motif on the mobile home (which
  lost the hero), the afisha header, the event page header, and the cabinet — so
  the atmosphere is felt without competing with content.
- Strictly monochrome ornament tinted by opacity over existing tokens — introduce
  **no new color values**; the style guard must stay green.

**Patterns to follow:** the footer watermark (`Footer.tsx` ornament `img`) and the
hero's `backgroundImage: url('/ornament.svg')` band in `MainPage.tsx`.

**Test expectation:** primarily visual — verify via screenshots that the ornament
reads as subtle atmosphere (not busy), `npm run lint:styles` stays green, and no
new hex colors were introduced.

**Verification:** Pages feel less flat / carry Circassian texture; palette
unchanged; guard green.

### U6. Catalog & cabinet mobile density polish

**Goal:** Remove wasted mobile "air" and fix pinched elements on the catalog and
cabinet so they don't look like a shrunk desktop (R2, R7).

**Requirements:** R2, R7
**Dependencies:** U1 (reuse the mobile-density patterns established there)
**Files:** `src/pages/CatalogPage.tsx`, `src/components/EntrepreneurCabinet.tsx`

**Approach:**
- Audit mobile spacing on both screens: tighten oversized `py`/`gap` where the
  phone view wastes vertical space, and relax genuinely pinched clusters (e.g.
  cramped toolbars, stat tiles) so elements breathe correctly at 390px.
- Keep desktop spacing intact (`sm:`/`lg:` restore current values).

**Patterns to follow:** the mobile-density approach from U1; existing responsive
utilities already in these files.

**Test scenarios:**
- 390px: catalog and cabinet show no horizontal scroll; toolbars/tiles are neither
  squished nor floating in excess whitespace.
- 1280px: both screens visually unchanged.

**Verification:** Catalog and cabinet read as intentionally mobile-designed;
desktop unchanged; zero console errors.

---

## Risks & Dependencies

- **Desktop regressions** from making mobile the base. Mitigation: every unit
  verified at 1280px against the current look; the user can only check mobile
  until Friday, so desktop screenshots are the guardrail.
- **Ornament too busy / reads as color change.** Mitigation: very low opacity,
  monochrome asset, no new hex; verify by screenshot and the style guard.
- **Event data completeness** — some events may lack a long description or
  coordinates. Mitigation: graceful fallbacks (shortDescription; omit map).
- **Rollback need** while the user is away. Mitigation: feature branch + one
  commit per unit; nothing hits `main`/the server until reviewed.

---

## Verification Strategy

The repo verifies frontend via `npx tsc --noEmit`, `npm run lint:styles`,
`VITE_API_URL=/api npm run build`, and Playwright against the Docker stack on
`:4000` (no component unit tests). For every unit, run those four and capture
Playwright screenshots at **390px (mobile)** and **1280px (desktop)**, checking:
no horizontal scroll on mobile, hero hidden on mobile / present on desktop,
shorter footer on mobile, tabs not scrolling sideways, the event page rendering,
ornament reading as subtle atmosphere, and zero console errors. Work lands on
`feat/mobile-first` with per-unit commits; merge to `main` only after user review.

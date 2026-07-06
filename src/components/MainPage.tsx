import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Project, EventItem } from "../types";
import { ArrowRight, ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../LanguageContext";
import { ApiCategory } from "../lib/api";
import { paths } from "../lib/paths";
import { staggerContainer, staggerItem } from "../lib/motion";
import ProductCard, { ProductCardSkeleton } from "./catalog/ProductCard";
import { Button, Badge, Skeleton } from "./ui";

interface MainPageProps {
  /** Featured (API-sorted) published cards for the «Популярные проекты» carousel. */
  projects: Project[];
  /** Featured published events for the afisha preview. */
  events: EventItem[];
  /** Categories from the API — the icon tiles link by slug. */
  categories: ApiCategory[];
  loading: boolean;
}

// ─── Category SVG Illustrations (distinctive Circassian motifs — kept) ───────
function IconProducts({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <ellipse cx="26" cy="32" rx="16" ry="7" stroke={c} strokeWidth="1.8" />
      <path d="M18 32 Q18 22 26 20 Q34 22 34 32" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M22 26 Q24 23 26 25" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M28 25 Q30 22 32 25" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14 18 L14 12 M14 15 L12 13 M14 15 L16 13" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M38 18 L38 12 M38 15 L36 13 M38 15 L40 13" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="10" y1="39" x2="42" y2="39" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconHandwork({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <path d="M19 42 Q14 38 14 30 Q14 20 26 18 Q38 20 38 30 Q38 38 33 42 Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M22 18 L22 14 Q26 12 30 14 L30 18" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 28 Q44 28 44 34 Q44 40 38 40" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 32 Q23 30 25 32 Q27 34 29 32 Q31 30 33 32" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26 22 L28 24 L26 26 L24 24 Z" stroke={c} strokeWidth="1.2" />
    </svg>
  );
}
function IconBooks({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <path d="M10 14 L10 40 Q10 42 12 42 L26 38 L26 12 Q18 11 10 14Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M42 14 L42 40 Q42 42 40 42 L26 38 L26 12 Q34 11 42 14Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="26" y1="12" x2="26" y2="42" stroke={c} strokeWidth="1.4" />
      <line x1="14" y1="24" x2="22" y2="23" stroke={c} strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="28" x2="22" y2="27" stroke={c} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function IconPerfume({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <rect x="16" y="26" width="20" height="18" rx="4" stroke={c} strokeWidth="1.8" />
      <rect x="21" y="18" width="10" height="8" rx="2" stroke={c} strokeWidth="1.5" />
      <rect x="23" y="11" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.5" />
      <path d="M19 34 Q26 31 33 34" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconServices({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <path d="M8 32 L8 26 Q8 24 10 24 L16 24 L20 20 Q22 18 24 20 L18 26 L18 38 Q18 40 16 40 L10 40 Q8 40 8 38 Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M44 32 L44 26 Q44 24 42 24 L36 24 L32 20 Q30 18 28 20 L34 26 L34 38 Q34 40 36 40 L42 40 Q44 40 44 38 Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M18 26 L26 26 L34 26" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="22" r="3.5" stroke={c} strokeWidth="1.3" />
    </svg>
  );
}
function IconCulture({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <path d="M16 42 L16 24 Q16 14 26 10 Q36 14 36 24 L36 42" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 42 Q20 46 26 46 Q32 46 36 42" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="22" x2="39" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="22" x2="20" y2="44" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26" y1="22" x2="26" y2="45" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="32" y1="22" x2="32" y2="44" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconOther({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#4A6B4F";
  return (
    <svg width="54" height="54" viewBox="0 0 52 52" fill="none">
      <path d="M26 10 L32 20 L42 26 L32 32 L26 42 L20 32 L10 26 L20 20 Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="26" cy="26" r="4" stroke={c} strokeWidth="1.4" />
    </svg>
  );
}

function SectionHeader({ title, href, onMore }: { title: string; href?: string; onMore?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <h2 className="font-serif text-2xl sm:text-3xl text-ink tracking-tight">{title}</h2>
      {onMore && (
        <button onClick={onMore} className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-brand hover:gap-2 transition-all">
          {t("section.viewAll")} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Horizontal, draggable/scrollable row with snap + desktop arrow controls.
function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => ref.current?.scrollBy({ left: dir * 460, behavior: "smooth" });
  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 px-1 -mx-1"
      >
        {children}
      </div>
      <button
        onClick={() => nudge(-1)}
        aria-label="Прокрутить назад"
        className="hidden md:flex absolute left-0 -translate-x-1/2 top-[110px] -translate-y-1/2 w-10 h-10 rounded-full bg-surface border border-line shadow-pop items-center justify-center text-ink hover:bg-canvas active:scale-95 transition z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => nudge(1)}
        aria-label="Прокрутить вперёд"
        className="hidden md:flex absolute right-0 translate-x-1/2 top-[110px] -translate-y-1/2 w-10 h-10 rounded-full bg-surface border border-line shadow-pop items-center justify-center text-ink hover:bg-canvas active:scale-95 transition z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Static local icon set (M4 line-art) keyed by the seeded category names —
// links resolve to API slugs; unknown categories fall back to a neutral icon.
const CATEGORY_ICONS: { apiName: string; labelKey: string; Icon: (p: { active?: boolean }) => React.ReactElement }[] = [
  { apiName: "Продукты", labelKey: "cat.Products", Icon: IconProducts },
  { apiName: "Изделия ручной работы", labelKey: "cat.Handwork", Icon: IconHandwork },
  { apiName: "Книги", labelKey: "cat.Books", Icon: IconBooks },
  { apiName: "Парфюмерия", labelKey: "cat.Perfume", Icon: IconPerfume },
  { apiName: "Услуги", labelKey: "cat.Services", Icon: IconServices },
  { apiName: "Культура и творчество", labelKey: "cat.Culture", Icon: IconCulture },
];

export default function MainPage({ projects, events, categories, loading }: MainPageProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const featured = projects.slice(0, 12);

  // Six M4 tiles: known names get their line-art icon, renamed/unknown API
  // categories fall back to a neutral ornament icon.
  const categoryTiles = (() => {
    if (categories.length === 0) {
      return CATEGORY_ICONS.map(({ apiName, labelKey, Icon }) => ({
        key: apiName,
        label: t(labelKey),
        Icon,
        slug: undefined as string | undefined,
      }));
    }
    const matched = CATEGORY_ICONS.flatMap(({ apiName, labelKey, Icon }) => {
      const cat = categories.find((c) => c.name === apiName);
      return cat ? [{ key: cat.slug, label: t(labelKey), Icon, slug: cat.slug as string | undefined }] : [];
    });
    const knownNames = new Set(CATEGORY_ICONS.map((c) => c.apiName));
    const extras = categories
      .filter((c) => !knownNames.has(c.name))
      .map((c) => ({ key: c.slug, label: c.name, Icon: IconOther, slug: c.slug as string | undefined }));
    return [...matched, ...extras].slice(0, 6);
  })();

  const goCategory = (slug?: string) =>
    navigate(slug ? `${paths.catalog}?cat=${encodeURIComponent(slug)}` : paths.catalog);

  return (
    <div className="text-ink">
      {/* ────────── Hero — карточка с орнаментной кромкой (M4) ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <div className="relative overflow-hidden rounded-xl border border-line bg-hero">
          {/* Орнаментная лента по левому краю */}
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-16 opacity-[0.18] pointer-events-none hidden sm:block"
            style={{ backgroundImage: "url('/ornament.svg')", backgroundSize: "64px 64px", backgroundRepeat: "repeat-y", backgroundPosition: "center top" }}
          />
          {/* Фото башни справа */}
          <div className="absolute right-0 top-0 bottom-0 w-[58%] lg:w-[52%] hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&q=80&w=1200"
              alt="Сторожевая башня в горах Кавказа"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #F1EBDD 2%, rgba(241,235,221,0.88) 22%, rgba(241,235,221,0.35) 52%, transparent 78%)" }} />
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 px-6 sm:px-16 lg:px-20 py-12 md:py-16">
            <div className="max-w-[560px]">
              <motion.h1 variants={staggerItem} className="font-serif text-4xl md:text-5xl font-semibold text-brand leading-[1.1] tracking-tight text-balance">
                {t("hero.title")}
              </motion.h1>
              <motion.p variants={staggerItem} className="mt-4 text-base text-ink-soft leading-relaxed max-w-[440px]">
                {t("hero.subtitle")}
              </motion.p>

              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button size="lg" onClick={() => navigate(paths.catalog)}>
                  {t("hero.btn.catalog")} <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────── Categories ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categoryTiles.map(({ key, label, Icon, slug }) => (
            <button
              key={key}
              onClick={() => goCategory(slug)}
              id={`cat-card-${key}`}
              className="group flex flex-col items-center justify-center gap-2.5 py-6 px-3 rounded-md bg-surface border border-line shadow-sm text-center
                         transition-[transform,box-shadow,border-color] duration-200 ease-out
                         [@media(hover:hover)]:hover:-translate-y-1 hover:shadow-card hover:border-line-strong active:scale-[0.98]"
            >
              <Icon />
              <span className="text-xs sm:text-sm font-medium text-ink leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ────────── Popular ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader title={t("section.catalog.title")} onMore={() => navigate(paths.catalog)} />
        {loading ? (
          <div className="flex gap-3 sm:gap-4 overflow-hidden pb-2 px-1 -mx-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[180px] sm:w-[210px]">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="py-16 text-center text-ink-soft">Пока нет опубликованных проектов.</div>
        ) : (
          <Carousel>
            {featured.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-[180px] sm:w-[210px]">
                <ProductCard project={p} />
              </div>
            ))}
          </Carousel>
        )}
      </section>

      {/* ────────── Afisha preview ────────── */}
      {loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-line">
          <SectionHeader title={t("section.afisha.title")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface border border-line rounded-md overflow-hidden">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="p-4 flex flex-col gap-2.5">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {!loading && events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-line">
          <SectionHeader title={t("section.afisha.title")} onMore={() => navigate(paths.afisha)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(events as EventItem[]).filter((e) => e.status === "Опубликовано").slice(0, 3).map((ev) => (
              <button
                key={ev.id}
                onClick={() => navigate(paths.afisha)}
                className="group text-left bg-surface border border-line rounded-md shadow-card overflow-hidden transition-[box-shadow,translate] duration-200 [@media(hover:hover)]:hover:-translate-y-1 hover:shadow-pop"
              >
                <div className="aspect-[16/10] overflow-hidden bg-canvas img-outline">
                  <img src={ev.image} alt={ev.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <Badge tone="brand">{ev.type}</Badge>
                  <h3 className="mt-2 font-serif text-lg text-ink leading-snug">{ev.title}</h3>
                  <div className="mt-2 flex flex-col gap-1 text-xs text-ink-faint">
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{ev.dateStr}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

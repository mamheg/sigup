import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Project, ProjectCategory, EventItem, ProjectStatus } from "../types";
import { Search, ChevronDown, ArrowRight, Store, Plus, CalendarDays, MapPin, Megaphone } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../LanguageContext";
import { paths } from "../lib/paths";
import { staggerContainer, staggerItem } from "../lib/motion";
import ProductCard from "./catalog/ProductCard";
import { Button, Badge } from "./ui";

interface MainPageProps {
  projects: Project[];
  events: EventItem[];
  announcements: { id: string; text: string; date: string }[];
  onSelectProject: (projectId: string) => void;
  onOpenAddCardModal: () => void;
}

// ─── Category SVG Illustrations (distinctive Circassian motifs — kept) ───────
function IconProducts({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
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
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
      <path d="M19 42 Q14 38 14 30 Q14 20 26 18 Q38 20 38 30 Q38 38 33 42 Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M22 18 L22 14 Q26 12 30 14 L30 18" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 28 Q44 28 44 34 Q44 40 38 40" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 32 Q23 30 25 32 Q27 34 29 32 Q31 30 33 32" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26 22 L28 24 L26 26 L24 24 Z" stroke={c} strokeWidth="1.2" />
    </svg>
  );
}
function IconBooks({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
      <path d="M10 14 L10 40 Q10 42 12 42 L26 38 L26 12 Q18 11 10 14Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M42 14 L42 40 Q42 42 40 42 L26 38 L26 12 Q34 11 42 14Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="26" y1="12" x2="26" y2="42" stroke={c} strokeWidth="1.4" />
      <line x1="14" y1="24" x2="22" y2="23" stroke={c} strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="28" x2="22" y2="27" stroke={c} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function IconPerfume({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
      <rect x="16" y="26" width="20" height="18" rx="4" stroke={c} strokeWidth="1.8" />
      <rect x="21" y="18" width="10" height="8" rx="2" stroke={c} strokeWidth="1.5" />
      <rect x="23" y="11" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.5" />
      <path d="M19 34 Q26 31 33 34" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconServices({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
      <path d="M8 32 L8 26 Q8 24 10 24 L16 24 L20 20 Q22 18 24 20 L18 26 L18 38 Q18 40 16 40 L10 40 Q8 40 8 38 Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M44 32 L44 26 Q44 24 42 24 L36 24 L32 20 Q30 18 28 20 L34 26 L34 38 Q34 40 36 40 L42 40 Q44 40 44 38 Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M18 26 L26 26 L34 26" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="22" r="3.5" stroke={c} strokeWidth="1.3" />
    </svg>
  );
}
function IconCulture({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
      <path d="M16 42 L16 24 Q16 14 26 10 Q36 14 36 24 L36 42" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 42 Q20 46 26 46 Q32 46 36 42" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="22" x2="39" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="22" x2="20" y2="44" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26" y1="22" x2="26" y2="45" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="32" y1="22" x2="32" y2="44" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
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

export default function MainPage({ projects, events, announcements }: MainPageProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [showLoc, setShowLoc] = useState(false);

  const published = useMemo(() => projects.filter((p) => p.status === ProjectStatus.Published), [projects]);
  const cities = useMemo(() => Array.from(new Set(published.map((p) => p.city))).sort((a, b) => a.localeCompare(b, "ru")), [published]);

  const featured = useMemo(() => {
    return [...published].sort((a, b) => (a.isFeatured === b.isFeatured ? (b.rating ?? 0) - (a.rating ?? 0) : a.isFeatured ? -1 : 1)).slice(0, 10);
  }, [published]);

  const runSearch = () => {
    const p = new URLSearchParams();
    if (searchQuery.trim()) p.set("q", searchQuery.trim());
    if (location !== "all") p.set("city", location);
    navigate(`${paths.catalog}${p.toString() ? `?${p}` : ""}`);
  };

  const categoriesDef = [
    { cat: ProjectCategory.Products, label: t("cat.Products"), Icon: IconProducts },
    { cat: ProjectCategory.Handwork, label: t("cat.Handwork"), Icon: IconHandwork },
    { cat: ProjectCategory.Books, label: t("cat.Books"), Icon: IconBooks },
    { cat: ProjectCategory.Perfume, label: t("cat.Perfume"), Icon: IconPerfume },
    { cat: ProjectCategory.Services, label: t("cat.Services"), Icon: IconServices },
    { cat: ProjectCategory.Culture, label: t("cat.Culture"), Icon: IconCulture },
  ];

  const goCategory = (cat: ProjectCategory) => navigate(`${paths.catalog}?cat=${encodeURIComponent(cat)}`);

  return (
    <div className="text-ink">
      {/* ────────── Hero ────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-[55%] lg:w-[50%] hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&q=80&w=1000"
            alt="Горы Северного Кавказа"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #FCFCFB 2%, rgba(252,252,251,0.85) 22%, rgba(252,252,251,0.35) 50%, transparent 72%)" }} />
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 w-full">
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
              <Button size="lg" variant="secondary" onClick={() => navigate(paths.create)}>
                {t("hero.btn.publish")} <Plus className="w-4 h-4 text-gold" />
              </Button>
            </motion.div>

            {/* Search */}
            <motion.div variants={staggerItem} className="mt-7 bg-surface rounded-lg shadow-card border border-line p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2.5 flex-1 px-3">
                <Search className="w-4 h-4 text-ink-faint shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder={t("search.placeholder")}
                  className="w-full h-11 bg-transparent outline-none text-sm placeholder:text-ink-faint"
                />
              </div>
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowLoc(!showLoc)}
                  className="w-full sm:w-36 h-11 px-3 rounded-sm border border-line bg-canvas hover:border-line-strong flex items-center justify-between gap-2 text-sm font-medium text-ink-soft transition-colors"
                >
                  <span className="truncate">{location === "all" ? t("location.all") : location}</span>
                  <ChevronDown className="w-4 h-4 text-ink-faint shrink-0" />
                </button>
                {showLoc && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowLoc(false)} />
                    <div className="absolute right-0 top-full mt-1.5 w-full min-w-[180px] bg-surface rounded-md border border-line shadow-pop py-1.5 z-20 max-h-56 overflow-y-auto">
                      {["all", ...cities].map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { setLocation(loc); setShowLoc(false); }}
                          className={`w-full text-left px-3.5 py-2 text-sm hover:bg-canvas transition-colors ${location === loc ? "text-brand font-medium" : "text-ink-soft"}`}
                        >
                          {loc === "all" ? t("location.all") : loc}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <Button size="lg" onClick={runSearch} className="sm:w-auto">{t("search.btn")}</Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ────────── Categories ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categoriesDef.map(({ cat, label, Icon }) => (
            <button
              key={cat}
              onClick={() => goCategory(cat)}
              id={`cat-card-${cat}`}
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
        {featured.length === 0 ? (
          <div className="py-16 text-center text-ink-soft">Пока нет опубликованных проектов.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* ────────── Afisha preview ────────── */}
      {events.length > 0 && (
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

      {/* ────────── Announcements preview ────────── */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-line">
          <SectionHeader title={t("section.announcements.title")} onMore={() => navigate(paths.announcements)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 4).map((ann) => (
              <div key={ann.id} className="flex gap-3.5 bg-surface border border-line rounded-md shadow-card p-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-brand-muted flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-ink leading-relaxed line-clamp-3">{ann.text}</p>
                  <p className="mt-1.5 text-xs text-ink-faint">{ann.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ────────── CTA ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-brand rounded-lg p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between overflow-hidden relative">
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-14 h-14 rounded-md bg-white/10 flex items-center justify-center shrink-0">
              <Store className="w-7 h-7 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white">{t("cta.entrepreneur.title")}</h2>
              <p className="mt-1.5 text-sm text-white/70 max-w-md leading-relaxed">{t("cta.entrepreneur.desc")}</p>
            </div>
          </div>
          <Button size="lg" variant="gold" onClick={() => navigate(paths.create)} className="shrink-0 relative z-10">
            {t("cta.entrepreneur.btn")} <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

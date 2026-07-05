import React, { useState, useMemo } from "react";
import { Project, ProjectCategory, EventItem, ProjectStatus } from "../types";
import {
  Search, MapPin, Heart, ChevronRight, ChevronLeft, Calendar, ArrowRight, Store,
  FileText, CheckCircle2, Plus, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface MainPageProps {
  projects: Project[];
  events: EventItem[];
  announcements: { id: string; text: string; date: string }[];
  onSelectProject: (projectId: string) => void;
  onOpenAddCardModal: () => void;
}

// ─── Category SVG Illustrations ─────────────────────────────────────────────

// Продукты — традиционный стол с черкесской едой (хлеб, сыр, зелень)
function IconProducts({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* тарелка */}
      <ellipse cx="26" cy="32" rx="16" ry="7" stroke={c} strokeWidth="1.8" fill="none"/>
      {/* каравай хлеба */}
      <path d="M18 32 Q18 22 26 20 Q34 22 34 32" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* надрезы на хлебе */}
      <path d="M22 26 Q24 23 26 25" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M28 25 Q30 22 32 25" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      {/* зерна/колосья */}
      <path d="M14 18 L14 12 M14 15 L12 13 M14 15 L16 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M38 18 L38 12 M38 15 L36 13 M38 15 L40 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      {/* листья зелени */}
      <path d="M20 20 Q17 16 20 14" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M32 20 Q35 16 32 14" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* горизонтальные линии стола */}
      <line x1="10" y1="39" x2="42" y2="39" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="12" y1="42" x2="40" y2="42" stroke={c} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3"/>
    </svg>
  );
}

// Ручная работа — керамический кувшин с черкесским орнаментом
function IconHandwork({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* тело кувшина */}
      <path d="M19 42 Q14 38 14 30 Q14 20 26 18 Q38 20 38 30 Q38 38 33 42 Z" stroke={c} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      {/* горлышко */}
      <path d="M22 18 L22 14 Q26 12 30 14 L30 18" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* ручка */}
      <path d="M38 28 Q44 28 44 34 Q44 40 38 40" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* черкесский орнамент — завитки */}
      <path d="M22 26 Q24 24 26 26 Q28 28 30 26" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M21 32 Q23 30 25 32 Q27 34 29 32 Q31 30 33 32" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* ромбы-украшения */}
      <path d="M26 22 L28 24 L26 26 L24 24 Z" stroke={c} strokeWidth="1.2" fill="none"/>
      {/* носик */}
      <path d="M14 26 Q9 26 8 30 Q9 33 14 32" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// Книги — открытая книга с черкесскими символами
function IconBooks({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* левая страница */}
      <path d="M10 14 L10 40 Q10 42 12 42 L26 38 L26 12 Q18 11 10 14Z" stroke={c} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      {/* правая страница */}
      <path d="M42 14 L42 40 Q42 42 40 42 L26 38 L26 12 Q34 11 42 14Z" stroke={c} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      {/* корешок */}
      <line x1="26" y1="12" x2="26" y2="42" stroke={c} strokeWidth="1.4"/>
      {/* строчки на левой странице */}
      <line x1="14" y1="22" x2="23" y2="21" stroke={c} strokeWidth="1" strokeLinecap="round"/>
      <line x1="14" y1="26" x2="23" y2="25" stroke={c} strokeWidth="1" strokeLinecap="round"/>
      <line x1="14" y1="30" x2="21" y2="29" stroke={c} strokeWidth="1" strokeLinecap="round"/>
      {/* арабская/черкесская буква на правой */}
      <path d="M29 24 Q32 20 35 24 Q38 28 35 30 Q32 32 29 30" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M32 24 L32 34" stroke={c} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// Парфюмерия — флакон духов
function IconPerfume({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* флакон */}
      <rect x="16" y="26" width="20" height="18" rx="4" stroke={c} strokeWidth="1.8" fill="none"/>
      {/* горлышко */}
      <rect x="21" y="18" width="10" height="8" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
      {/* распылитель */}
      <line x1="26" y1="14" x2="26" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="23" y="11" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.5" fill="none"/>
      {/* трубочка распылителя */}
      <line x1="29" y1="13" x2="36" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="36" cy="13" r="2" stroke={c} strokeWidth="1.2" fill="none"/>
      {/* фигурная линия на флаконе */}
      <path d="M19 34 Q26 31 33 34" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* капли аромата */}
      <path d="M20 22 Q18 19 20 17" stroke={c} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M26 21 Q24 17 26 14" stroke={c} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M32 22 Q34 19 32 17" stroke={c} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

// Услуги — рукопожатие
function IconServices({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* левая рука */}
      <path d="M8 32 L8 26 Q8 24 10 24 L16 24 L20 20 Q22 18 24 20 L18 26 L18 38 Q18 40 16 40 L10 40 Q8 40 8 38 Z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/>
      {/* правая рука */}
      <path d="M44 32 L44 26 Q44 24 42 24 L36 24 L32 20 Q30 18 28 20 L34 26 L34 38 Q34 40 36 40 L42 40 Q44 40 44 38 Z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/>
      {/* рукопожатие */}
      <path d="M18 26 L26 26 L34 26" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      {/* пальцы левой */}
      <path d="M20 20 L20 16" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M22 19 L22 15" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M24 20 L24 16" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      {/* пальцы правой */}
      <path d="M32 20 L32 16" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M30 19 L30 15" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M28 20 L28 16" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      {/* орнамент-звёздочка */}
      <circle cx="26" cy="22" r="3.5" stroke={c} strokeWidth="1.3" fill="none"/>
      <line x1="26" y1="18.5" x2="26" y2="15" stroke={c} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// Культура — кавказская лира (пшинэ)
function IconCulture({ active }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "#8C7355";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* корпус лиры */}
      <path d="M16 42 L16 24 Q16 14 26 10 Q36 14 36 24 L36 42" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* нижняя дуга */}
      <path d="M16 42 Q20 46 26 46 Q32 46 36 42" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* поперечная перекладина */}
      <line x1="13" y1="22" x2="39" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      {/* струны */}
      <line x1="20" y1="22" x2="20" y2="44" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="26" y1="22" x2="26" y2="45" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="32" y1="22" x2="32" y2="44" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      {/* колки */}
      <circle cx="13" cy="22" r="2.5" stroke={c} strokeWidth="1.3" fill="none"/>
      <circle cx="39" cy="22" r="2.5" stroke={c} strokeWidth="1.3" fill="none"/>
      {/* декоративный элемент */}
      <path d="M22 16 Q26 14 30 16" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Hero Section Photo (Caucasus watchtower) ────────────────────────────────
function HeroIllustration() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[55%] lg:w-[52%] hidden md:block overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&q=80&w=800"
        alt="Caucasian watchtower in the mountains"
        className="w-full h-full object-cover"
      />
      {/* Left-edge gradient overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #FCFBF9 0%, #FCFBF9 5%, rgba(252,251,249,0.85) 20%, rgba(252,251,249,0.4) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function MainPage({
  projects,
  events,
  announcements,
  onSelectProject,
  onOpenAddCardModal
}: MainPageProps) {
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(t("location.all"));
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [likedProjects, setLikedProjects] = useState<string[]>(["uzdyh-cheese"]);

  const publishedProjects = useMemo(
    () => projects.filter(p => p.status === ProjectStatus.Published),
    [projects]
  );

  const locations = useMemo(() => {
    const list = new Set<string>();
    publishedProjects.forEach(p => { if (p.city) list.add(p.city); });
    return [t("location.all"), ...Array.from(list)];
  }, [publishedProjects, t]);

  const filteredProjects = useMemo(() => {
    return publishedProjects.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesLocation = selectedLocation === t("location.all") ? true : p.city === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [publishedProjects, searchQuery, selectedCategory, selectedLocation, t]);

  const handleLikeToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedProjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const categoriesDef = [
    { cat: ProjectCategory.Products, label: t("cat.Products"), Icon: IconProducts },
    { cat: ProjectCategory.Handwork, label: t("cat.Handwork"), Icon: IconHandwork },
    { cat: ProjectCategory.Books, label: t("cat.Books"), Icon: IconBooks },
    { cat: ProjectCategory.Perfume, label: t("cat.Perfume"), Icon: IconPerfume },
    { cat: ProjectCategory.Services, label: t("cat.Services"), Icon: IconServices },
    { cat: ProjectCategory.Culture, label: t("cat.Culture"), Icon: IconCulture },
  ];

  const featuredProjects = filteredProjects.slice(0, 5);

  return (
    <div className="font-sans text-[#2A2622] bg-[#FCFBF9]">

      {/* ────────── Hero ────────── */}
      <section className="relative bg-[#FCFBF9] overflow-hidden min-h-[420px] md:min-h-[480px] flex items-center">
        <HeroIllustration />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="max-w-[520px]">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl md:text-[42px] font-serif font-bold text-[#244D33] leading-[1.15] tracking-tight"
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-[15px] text-[#6B7280] leading-relaxed font-light max-w-[420px]"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 mt-8"
            >
              <button
                onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                id="hero-go-catalog-btn"
                className="flex items-center justify-center gap-2 bg-[#244D33] hover:bg-[#1e3f2a] text-white px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span>{t("hero.btn.catalog")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAddCardModal}
                id="hero-add-project-btn"
                className="flex items-center justify-center gap-2 bg-white hover:bg-[#F5F2EC] text-[#244D33] border border-[#EEEAE1] hover:border-[#C79E61]/50 px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all duration-200 cursor-pointer"
              >
                <span>{t("hero.btn.publish")}</span>
                <Plus className="w-4 h-4 text-[#C79E61]" />
              </button>
            </motion.div>

            {/* Search bar — inside hero left column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 bg-white rounded-2xl shadow-lg border border-[#EEEAE1] p-2.5 flex flex-col sm:flex-row gap-2 items-stretch"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 flex-1 border border-[#EEEAE1] rounded-xl px-4 py-2.5 bg-[#FCFBF9] focus-within:border-[#244D33] transition-colors">
                <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  id="main-search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[13px] text-[#374151] placeholder-[#9CA3AF] font-sans"
                />
              </div>

              {/* Location selector */}
              <div className="relative shrink-0">
                <button
                  id="main-location-select"
                  onClick={() => setShowLocDropdown(!showLocDropdown)}
                  className="w-full sm:w-32 border border-[#EEEAE1] rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 bg-[#FCFBF9] hover:bg-[#F5F2EC] text-[13px] font-medium text-[#374151] cursor-pointer transition-colors"
                >
                  <span className="truncate">{selectedLocation}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                </button>

                <AnimatePresence>
                  {showLocDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLocDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-1 w-full min-w-[160px] bg-white rounded-xl shadow-xl border border-[#EEEAE1] py-1.5 z-20 max-h-52 overflow-y-auto"
                      >
                        {locations.map(loc => (
                          <button
                            key={loc}
                            onClick={() => { setSelectedLocation(loc); setShowLocDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F5F2EC] cursor-pointer transition-colors ${
                              selectedLocation === loc ? "text-[#244D33] font-semibold" : "text-[#374151]"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Search button */}
              <button
                onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                id="main-search-submit-btn"
                className="bg-[#244D33] hover:bg-[#1e3f2a] text-white px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {t("search.btn")}
              </button>
            </motion.div>
          </div>
        </div>


      </section>

      {/* ────────── Categories ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4"
        >
          {categoriesDef.map(({ cat, label, Icon }, idx) => {
            const isActive = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                id={`cat-card-${cat}`}
                onClick={() => {
                  if (isActive) {
                    setSelectedCategory(null);
                  } else {
                    setSelectedCategory(cat);
                    setTimeout(() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" }), 150);
                  }
                }}
                className={`category-card select-none ${isActive ? "active" : ""}`}
              >
                <Icon active={isActive} />
                <span className={`text-[11px] sm:text-[12px] font-semibold leading-tight ${isActive ? "text-white" : "text-[#374151]"}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#C79E61]" />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ────────── Popular Catalog ────────── */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-[28px] font-serif font-bold text-[#244D33]">
            {selectedCategory
              ? categoriesDef.find(c => c.cat === selectedCategory)?.label || selectedCategory
              : t("section.catalog.title")}
          </h2>
          <button
            onClick={() => { setSelectedCategory(null); setSelectedLocation(t("location.all")); setSearchQuery(""); }}
            className="flex items-center gap-1 text-[13px] text-[#6B7280] hover:text-[#244D33] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{t("section.viewAll")}</span>
            <ChevronRight className="w-4 h-4 text-[#C79E61]" />
          </button>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-[#EEEAE1] max-w-md mx-auto">
            <Store className="w-10 h-10 text-[#C79E61] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#244D33]">Проекты не найдены</h3>
            <p className="text-sm text-[#6B7280] mt-2 font-light">Попробуйте изменить фильтры</p>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedLocation(t("location.all")); setSearchQuery(""); }}
              className="mt-4 px-6 py-2.5 bg-[#244D33] text-white rounded-full text-xs font-semibold cursor-pointer"
            >
              Сбросить
            </button>
          </div>
        ) : (
          <div className="h-scroll-track pb-3">
            {featuredProjects.map(p => (
              <div
                key={p.id}
                id={`project-card-${p.id}`}
                onClick={() => onSelectProject(p.id)}
                className="snap-start shrink-0 w-[220px] sm:w-[240px] bg-white rounded-2xl overflow-hidden border border-[#EEEAE1] hover:border-[#C79E61]/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col card-hover"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] bg-stone-50 overflow-hidden">
                  <img
                    src={p.photos?.[0] || "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=400"}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category badge */}
                  <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-[#244D33] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#EEEAE1]/60">
                    {p.category}
                  </div>
                  {/* Like */}
                  <button
                    id={`like-btn-${p.id}`}
                    onClick={e => handleLikeToggle(e, p.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedProjects.includes(p.id) ? "fill-rose-500 text-rose-500" : "text-[#9CA3AF]"}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-[14px] font-serif font-bold text-[#244D33] line-clamp-1 group-hover:text-[#C79E61] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed font-light flex-1">
                    {p.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                    <MapPin className="w-3 h-3 text-[#C79E61] shrink-0" />
                    <span className="truncate">{p.city}, {p.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ────────── Afisha ────────── */}
      <section id="afisha-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#EEEAE1]/60 scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-[28px] font-serif font-bold text-[#244D33]">
            {t("section.afisha.title")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="text-[13px] text-[#6B7280] hover:text-[#244D33] flex items-center gap-1 cursor-pointer mr-2 whitespace-nowrap"
            >
              <span>{t("section.viewAll")}</span>
              <ChevronRight className="w-4 h-4 text-[#C79E61]" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("afisha-track");
                if (el) el.scrollLeft -= 260;
              }}
              id="afisha-prev-btn"
              className="w-8 h-8 rounded-full border border-[#EEEAE1] flex items-center justify-center text-[#244D33] bg-white hover:bg-[#F5F2EC] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("afisha-track");
                if (el) el.scrollLeft += 260;
              }}
              id="afisha-next-btn"
              className="w-8 h-8 rounded-full border border-[#EEEAE1] flex items-center justify-center text-[#244D33] bg-white hover:bg-[#F5F2EC] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          id="afisha-track"
          className="h-scroll-track pb-3"
          style={{ scrollBehavior: "smooth" }}
        >
          {events.map(ev => (
            <div
              key={ev.id}
              id={`event-card-${ev.id}`}
              className="snap-start shrink-0 w-[220px] sm:w-[240px] bg-white rounded-2xl overflow-hidden border border-[#EEEAE1] hover:border-[#C79E61]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col card-hover cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[3/2] bg-stone-100 overflow-hidden">
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-[13px] font-bold text-white leading-tight line-clamp-2">
                    {ev.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#374151]">
                  <Calendar className="w-3.5 h-3.5 text-[#C79E61] shrink-0" />
                  <span>{ev.dateStr}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{ev.location}</span>
                </div>
                <button className="flex items-center gap-1 text-[12px] font-semibold text-[#C79E61] hover:text-[#244D33] transition-colors cursor-pointer mt-1">
                  <span>Подробнее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────── Announcements ────────── */}
      <section id="announcements-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#EEEAE1]/60 scroll-mt-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#244D33] flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#244D33]">{t("section.announcements.title")}</h2>
            <p className="text-[12px] text-[#6B7280] font-light">{t("section.announcements.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map(ann => (
            <div
              key={ann.id}
              id={`ann-card-${ann.id}`}
              className="bg-white rounded-2xl p-5 border border-[#EEEAE1] hover:border-[#C79E61]/35 shadow-sm transition-all duration-300 card-hover"
            >
              <span className="text-[9px] font-mono font-bold text-[#244D33] bg-[#F0F4EF] py-1 px-2.5 rounded-full uppercase tracking-wider">
                {ann.date}
              </span>
              <p className="text-[13px] text-[#4B5563] leading-relaxed mt-3 font-light">
                {ann.text}
              </p>
              <button className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#C79E61] hover:text-[#244D33] transition-colors cursor-pointer uppercase tracking-wider">
                <span>Связаться по объявлению</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ────────── CTA Entrepreneur ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-10">
        <div className="bg-[#F5F2EC] rounded-2xl border border-[#EEEAE1] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
          {/* Left icon */}
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EEEAE1] flex items-center justify-center shrink-0">
              <Store className="w-7 h-7 text-[#244D33]" />
            </div>
            <div>
              <h2 className="text-[18px] font-serif font-bold text-[#244D33]">{t("cta.entrepreneur.title")}</h2>
              <p className="text-[13px] text-[#6B7280] font-light mt-1 max-w-sm">{t("cta.entrepreneur.desc")}</p>
            </div>
          </div>

          {/* 3 steps */}
          <div className="flex flex-col sm:flex-row gap-4 text-[12px] text-[#6B7280] font-light">
            {[
              { icon: "📢", text: t("cta.entrepreneur.step1") },
              { icon: "👥", text: t("cta.entrepreneur.step2") },
              { icon: "🤝", text: t("cta.entrepreneur.step3") },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 max-w-[140px]">
                <span className="text-base shrink-0">{step.icon}</span>
                <span className="leading-tight">{step.text}</span>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAddCardModal}
              id="cta-join-bottom-btn"
              className="flex items-center gap-2 bg-[#244D33] hover:bg-[#1e3f2a] text-white px-6 py-3 rounded-xl text-[13px] font-semibold transition-all cursor-pointer shadow-sm whitespace-nowrap"
            >
              <span>{t("cta.entrepreneur.btn")}</span>
              <Plus className="w-4 h-4" />
            </motion.button>
            <p className="text-[10px] text-[#9CA3AF] mt-2 text-center">{t("cta.entrepreneur.note")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

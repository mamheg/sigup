import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../lib/store";
import { ProjectCategory, ProjectStatus } from "../types";
import { staggerContainer, staggerItem } from "../lib/motion";
import ProductCard from "../components/catalog/ProductCard";
import FilterSidebar from "../components/catalog/FilterSidebar";
import SortControl, { SortKey } from "../components/catalog/SortControl";

const SORT_KEYS: SortKey[] = ["featured", "rating", "name"];

export default function CatalogPage() {
  const { projects } = useStore();
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const rawCat = params.get("cat");
  const category: ProjectCategory | "all" =
    rawCat && (Object.values(ProjectCategory) as string[]).includes(rawCat) ? (rawCat as ProjectCategory) : "all";
  const city = params.get("city") ?? "all";
  const sort = (SORT_KEYS.includes(params.get("sort") as SortKey) ? params.get("sort") : "featured") as SortKey;
  const sheetOpen = params.get("filters") === "1";

  const setParam = (key: string, value: string | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );
  };

  const published = useMemo(() => projects.filter((p) => p.status === ProjectStatus.Published), [projects]);

  const categories = useMemo(() => {
    const present = new Set(published.map((p) => p.category));
    return Object.values(ProjectCategory).filter((c) => present.has(c));
  }, [published]);

  const cities = useMemo(
    () => Array.from(new Set(published.map((p) => p.city))).sort((a, b) => a.localeCompare(b, "ru")),
    [published]
  );

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = published.filter((p) => {
      const matchesCat = category === "all" || p.category === category;
      const matchesCity = city === "all" || p.city === city;
      const matchesQ =
        !needle ||
        p.name.toLowerCase().includes(needle) ||
        p.shortDescription.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle);
      return matchesCat && matchesCity && matchesQ;
    });
    return filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "ru");
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      // featured: featured first, then rating
      if (!!a.isFeatured !== !!b.isFeatured) return a.isFeatured ? -1 : 1;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [published, q, category, city, sort]);

  const hasActive = category !== "all" || city !== "all" || q.trim() !== "";
  const clearAll = () => setParams({}, { replace: true });

  const filterProps = {
    categories,
    cities,
    selectedCategory: category,
    selectedCity: city,
    onCategory: (c: ProjectCategory | "all") => setParam("cat", c),
    onCity: (c: string) => setParam("city", c),
    onClear: clearAll,
    hasActive,
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <title>Каталог — SiGup</title>
      <meta name="description" content="Каталог черкесских товаров, услуг и предпринимателей: сыр, ремесло, книги, одежда и другое." />

      <header className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Каталог</h1>
        <p className="mt-1 text-ink-soft">Товары, услуги и мастера черкесского сообщества.</p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
        <input
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
          placeholder="Что вы ищете? Например: сыр, одежда, мастерская…"
          className="w-full h-12 pl-10 pr-4 rounded-sm bg-surface border border-line text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setParam("filters", "1")}
            className="lg:hidden inline-flex items-center gap-2 h-11 px-4 rounded-sm border border-line bg-surface text-sm font-medium text-ink hover:border-line-strong transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фильтры
          </button>
          <p className="text-sm text-ink-faint tabular">Найдено: {results.length}</p>
        </div>
        <SortControl value={sort} onChange={(v) => setParam("sort", v)} />
      </div>

      <div className="grid lg:grid-cols-[228px_1fr] gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-md border border-line bg-surface p-4 shadow-sm">
            <FilterSidebar {...filterProps} />
          </div>
        </aside>

        {/* Grid */}
        <div>
          {results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-ink-soft">По вашему запросу ничего не найдено.</p>
              <button className="mt-3 text-brand font-medium hover:underline" onClick={clearAll}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <motion.div
              key={`${category}-${city}-${sort}-${q}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
            >
              {results.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard project={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setParam("filters", null)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-surface rounded-t-lg border-t border-line p-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            >
              <div className="flex justify-end mb-1">
                <button onClick={() => setParam("filters", null)} aria-label="Закрыть" className="p-1.5 -mr-1.5 text-ink-soft hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar {...filterProps} />
              <button
                onClick={() => setParam("filters", null)}
                className="mt-5 w-full h-11 rounded-sm bg-brand text-brand-fg font-medium"
              >
                Показать: {results.length}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

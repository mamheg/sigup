import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { api, ApiCategory } from "../lib/api";
import { apiCardToProject } from "../lib/mappers";
import { Project } from "../types";
import { staggerContainer, staggerItem } from "../lib/motion";
import ProductCard, { ProductCardSkeleton } from "../components/catalog/ProductCard";
import FilterSidebar from "../components/catalog/FilterSidebar";
import SortControl, { SortKey } from "../components/catalog/SortControl";
import { Button } from "../components/ui";

const SORT_KEYS: SortKey[] = ["featured", "new", "name"];
const PER_PAGE = 24;

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("cat") ?? "all"; // category slug
  const country = params.get("country") ?? "all";
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

  // ─── Server data ───
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchId = useRef(0);

  // Categories + location facets: one-off (facets derived from the full published set).
  useEffect(() => {
    api.catalog.categories().then(setCategories).catch(() => {});
    api.catalog
      .cards({ per_page: 100 })
      .then(({ items }) => {
        const uniq = (values: (string | null | undefined)[]) =>
          Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, "ru"));
        setCountries(uniq(items.map((c) => c.country)));
        setCities(uniq(items.map((c) => c.city)));
      })
      .catch(() => {});
  }, []);

  // Server-side filtered results; refetched from page 1 on every filter change.
  const loadPage = (nextPage: number, append: boolean) => {
    const id = ++fetchId.current;
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setError(null);
    }
    api.catalog
      .cards({
        q: q.trim() || undefined,
        category: category === "all" ? undefined : category,
        country: country === "all" ? undefined : country,
        city: city === "all" ? undefined : city,
        sort,
        page: nextPage,
        per_page: PER_PAGE,
      })
      .then((res) => {
        if (id !== fetchId.current) return;
        const mapped = res.items.map(apiCardToProject);
        setItems((prev) => (append ? [...prev, ...mapped] : mapped));
        setTotal(res.total);
        setPage(nextPage);
      })
      .catch((e) => {
        if (id !== fetchId.current) return;
        if (!append) setError(e instanceof Error ? e.message : "Не удалось загрузить каталог");
      })
      .finally(() => {
        if (id !== fetchId.current) return;
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    loadPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, country, city, sort]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => (c.cards_count ?? 0) > 0 || c.slug === category),
    [categories, category]
  );

  const hasActive = category !== "all" || country !== "all" || city !== "all" || q.trim() !== "";
  const clearAll = () => setParams({}, { replace: true });
  const hasMore = items.length < total;

  const filterProps = {
    categories: visibleCategories,
    countries,
    cities,
    selectedCategory: category,
    selectedCountry: country,
    selectedCity: city,
    onCategory: (slug: string) => setParam("cat", slug),
    onCountry: (c: string) => setParam("country", c),
    onCity: (c: string) => setParam("city", c),
    onClear: clearAll,
    hasActive,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <title>Каталог — SiGup</title>
      <meta name="description" content="Каталог черкесских товаров, услуг и предпринимателей: сыр, ремесло, книги, одежда и другое." />

      <header className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Каталог</h1>
        {q ? (
          <p className="mt-1 text-ink-soft">
            Результаты по запросу <span className="text-ink font-medium">«{q}»</span>{" "}
            <button onClick={() => setParam("q", null)} className="text-brand hover:underline text-sm">сбросить</button>
          </p>
        ) : (
          <p className="mt-1 text-ink-soft">Товары, услуги и мастера черкесского сообщества.</p>
        )}
      </header>

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
          <p className="text-sm text-ink-faint tabular">{loading ? "Загрузка…" : `Найдено: ${total}`}</p>
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
          {error ? (
            <div className="py-24 text-center">
              <p className="text-ink-soft">{error}</p>
              <Button variant="secondary" className="mt-4" onClick={() => loadPage(1, false)}>
                <RotateCcw className="w-4 h-4" /> Повторить
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-ink-soft">По вашему запросу ничего не найдено.</p>
              <button className="mt-3 text-brand font-medium hover:underline" onClick={clearAll}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <motion.div
                key={`${category}-${country}-${city}-${sort}-${q}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
              >
                {items.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard project={p} />
                  </motion.div>
                ))}
              </motion.div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button variant="secondary" size="lg" disabled={loadingMore} onClick={() => loadPage(page + 1, true)}>
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Показать ещё
                  </Button>
                </div>
              )}
            </>
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
                Показать: {total}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { ProjectCategory } from "../../types";

interface FilterSidebarProps {
  categories: ProjectCategory[];
  cities: string[];
  selectedCategory: ProjectCategory | "all";
  selectedCity: string;
  onCategory: (c: ProjectCategory | "all") => void;
  onCity: (c: string) => void;
  onClear: () => void;
  hasActive: boolean;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-line last:border-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-3">{title}</h3>
      {children}
    </div>
  );
}

/** Filter panel — reused as a sticky desktop sidebar and a mobile bottom-sheet. */
export default function FilterSidebar({
  categories,
  cities,
  selectedCategory,
  selectedCity,
  onCategory,
  onCity,
  onClear,
  hasActive,
}: FilterSidebarProps) {
  const rowBase =
    "w-full text-left px-2.5 py-1.5 rounded-sm text-sm transition-colors duration-150 cursor-pointer";
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-ink">Фильтры</h2>
        {hasActive && (
          <button onClick={onClear} className="text-xs font-medium text-brand hover:underline">
            Сбросить
          </button>
        )}
      </div>

      <Group title="Категория">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onCategory("all")}
            className={`${rowBase} ${selectedCategory === "all" ? "bg-brand-muted text-brand font-medium" : "text-ink-soft hover:bg-canvas"}`}
          >
            Все категории
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategory(c)}
              className={`${rowBase} ${selectedCategory === c ? "bg-brand-muted text-brand font-medium" : "text-ink-soft hover:bg-canvas"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Город">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onCity("all")}
            className={`${rowBase} ${selectedCity === "all" ? "bg-brand-muted text-brand font-medium" : "text-ink-soft hover:bg-canvas"}`}
          >
            Везде
          </button>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => onCity(c)}
              className={`${rowBase} ${selectedCity === c ? "bg-brand-muted text-brand font-medium" : "text-ink-soft hover:bg-canvas"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Group>
    </div>
  );
}

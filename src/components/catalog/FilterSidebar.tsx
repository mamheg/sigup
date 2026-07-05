import { Check } from "lucide-react";
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
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

// One beautiful, consistent selected state for every filter row.
function Row({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center justify-between gap-2 text-left px-3 h-9 rounded-sm text-sm cursor-pointer " +
        "transition-[color,background-color] duration-150 " +
        (active
          ? "bg-brand text-brand-fg font-medium"
          : "text-ink-soft hover:bg-canvas hover:text-ink")
      }
    >
      <span className="truncate">{label}</span>
      {active && <Check className="w-4 h-4 shrink-0" />}
    </button>
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
        <Row active={selectedCategory === "all"} label="Все категории" onClick={() => onCategory("all")} />
        {categories.map((c) => (
          <Row key={c} active={selectedCategory === c} label={c} onClick={() => onCategory(c)} />
        ))}
      </Group>

      <Group title="Город">
        <Row active={selectedCity === "all"} label="Везде" onClick={() => onCity("all")} />
        {cities.map((c) => (
          <Row key={c} active={selectedCity === c} label={c} onClick={() => onCity(c)} />
        ))}
      </Group>
    </div>
  );
}

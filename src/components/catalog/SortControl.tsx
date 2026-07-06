import { ArrowUpDown, Check } from "lucide-react";
import { Popover } from "../ui";

/** Server-side sort keys — mirror GET /catalog/cards `sort` values. */
export type SortKey = "featured" | "new" | "name";

export const SORT_LABELS: Record<SortKey, string> = {
  featured: "Сначала популярные",
  new: "Сначала новые",
  name: "По названию",
};

/** Polished sort dropdown (matches LanguagePicker): a labelled trigger that
 *  opens a menu with the current option check-marked. No native <select>. */
export default function SortControl({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <Popover
      align="right"
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          aria-label="Сортировка"
          className={
            "inline-flex items-center gap-2 h-11 pl-3.5 pr-3.5 rounded-sm border text-sm font-medium transition-colors cursor-pointer whitespace-nowrap " +
            (open
              ? "border-line-strong bg-canvas text-ink"
              : "border-line bg-surface text-ink-soft hover:text-ink hover:border-line-strong")
          }
        >
          <ArrowUpDown className="w-4 h-4 text-ink-faint shrink-0" />
          <span className="hidden sm:inline text-ink-faint">Сортировка:</span>
          <span className="text-ink">{SORT_LABELS[value]}</span>
        </button>
      )}
    >
      {({ close }) =>
        (Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
          <button
            key={k}
            role="menuitem"
            onClick={() => {
              onChange(k);
              close();
            }}
            className={
              "w-full flex items-center justify-between gap-6 px-3 py-2 rounded-sm text-sm transition-colors text-left " +
              (k === value ? "text-brand font-medium bg-brand-muted" : "text-ink hover:bg-canvas")
            }
          >
            <span>{SORT_LABELS[k]}</span>
            {k === value && <Check className="w-4 h-4 text-brand shrink-0" />}
          </button>
        ))
      }
    </Popover>
  );
}

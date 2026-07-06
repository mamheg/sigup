import { Select } from "../ui";

/** Server-side sort keys — mirror GET /catalog/cards `sort` values. */
export type SortKey = "featured" | "new" | "name";

export const SORT_LABELS: Record<SortKey, string> = {
  featured: "Сначала популярные",
  new: "Сначала новые",
  name: "По названию",
};

export default function SortControl({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <div className="w-52">
      <Select value={value} onChange={(e) => onChange(e.target.value as SortKey)} aria-label="Сортировка">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {SORT_LABELS[k]}
          </option>
        ))}
      </Select>
    </div>
  );
}

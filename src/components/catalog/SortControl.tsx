import { Select } from "../ui";

export type SortKey = "featured" | "rating" | "name";

export const SORT_LABELS: Record<SortKey, string> = {
  featured: "Сначала популярные",
  rating: "По рейтингу",
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

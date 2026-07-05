import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
}

/** Inline rating: filled star + value (+ optional review count). Always visible on cards. */
export default function Rating({ value, count, className = "" }: RatingProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-gold-dark tabular ${className}`}>
      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
      {value.toFixed(1)}
      {count !== undefined && <span className="text-ink-faint font-normal">({count})</span>}
    </span>
  );
}

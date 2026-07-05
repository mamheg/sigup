import React from "react";

type Tone = "neutral" | "brand" | "gold" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-soft border border-line",
  brand: "bg-brand-muted text-brand border border-transparent",
  gold: "bg-gold/12 text-gold-dark border border-transparent",
  success: "bg-green-50 text-green-700 border border-transparent",
  warning: "bg-amber-50 text-amber-700 border border-transparent",
  danger: "bg-red-50 text-red-700 border border-transparent",
};

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  tone?: Tone;
};

export default function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]} ${className}`}
      {...props}
    />
  );
}

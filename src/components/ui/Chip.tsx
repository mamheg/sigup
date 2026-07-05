import React from "react";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Selectable pill used for category / filter chips. */
export default function Chip({ active, className = "", ...props }: ChipProps) {
  return (
    <button
      className={
        "inline-flex items-center h-9 px-3.5 rounded-full text-sm font-medium border cursor-pointer " +
        "transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.96] " +
        (active
          ? "bg-brand text-brand-fg border-brand"
          : "bg-surface text-ink-soft border-line hover:text-ink hover:border-line-strong") +
        " " +
        className
      }
      {...props}
    />
  );
}

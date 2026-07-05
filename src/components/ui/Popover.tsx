import React, { useEffect, useRef, useState } from "react";

export interface PopoverProps {
  trigger: (opts: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (opts: { close: () => void }) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

/**
 * Minimal accessible popover: a trigger + a floating panel that closes on
 * outside click or Escape. Used by the language picker and menus.
 */
export default function Popover({ trigger, children, align = "right", className = "" }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={
            "absolute z-50 mt-2 min-w-[11rem] rounded-md border border-line bg-surface shadow-pop p-1.5 " +
            "animate-fade-up " +
            (align === "right" ? "right-0" : "left-0")
          }
          role="menu"
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

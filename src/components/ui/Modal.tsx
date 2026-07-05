import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
}

const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

export default function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div
        className={`relative w-full ${widths[size]} max-h-[90vh] overflow-y-auto bg-surface border border-line rounded-lg shadow-pop animate-fade-up`}
        role="dialog"
        aria-modal="true"
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line sticky top-0 bg-surface z-10">
            <h3 className="font-serif text-xl text-ink">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="p-1.5 -mr-1.5 rounded-sm text-ink-soft hover:text-ink hover:bg-canvas transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line bg-canvas rounded-b-lg">{footer}</div>}
      </div>
    </div>
  );
}

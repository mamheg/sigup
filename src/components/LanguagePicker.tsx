import { Globe, Check } from "lucide-react";
import { useLanguage, type Language } from "../LanguageContext";
import { Popover } from "./ui";

const LANGS: { code: Language; short: string; name: string }[] = [
  { code: "ru", short: "RU", name: "Русский" },
  { code: "kbd", short: "KBD", name: "Адыгэбзэ" },
  { code: "en", short: "EN", name: "English" },
];

/** Compact language chip that opens a small popover to choose the language. */
export default function LanguagePicker({ full = false }: { full?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const current = LANGS.find((l) => l.code === language) ?? LANGS[0];

  return (
    <Popover
      align="right"
      className={full ? "w-full" : ""}
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          aria-label="Выбрать язык"
          className={
            "inline-flex items-center gap-1.5 h-9 px-3 rounded-sm border text-sm font-medium transition-colors cursor-pointer " +
            (full ? "w-full justify-between " : "") +
            (open
              ? "border-line-strong bg-canvas text-ink"
              : "border-line bg-surface text-ink-soft hover:text-ink hover:border-line-strong")
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-ink-faint" />
            {current.short}
          </span>
        </button>
      )}
    >
      {({ close }) =>
        LANGS.map((l) => (
          <button
            key={l.code}
            role="menuitem"
            onClick={() => {
              setLanguage(l.code);
              close();
            }}
            className={
              "w-full flex items-center justify-between gap-6 px-3 py-2 rounded-sm text-sm transition-colors text-left " +
              (l.code === language ? "text-brand font-medium bg-brand-muted" : "text-ink hover:bg-canvas")
            }
          >
            <span>
              {l.name} <span className="text-ink-faint">· {l.short}</span>
            </span>
            {l.code === language && <Check className="w-4 h-4 text-brand" />}
          </button>
        ))
      }
    </Popover>
  );
}

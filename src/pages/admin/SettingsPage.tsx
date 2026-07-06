/**
 * Настройки сайта — честная MVP-заглушка: показываем текущие значения,
 * редактирование живёт в конфигурации деплоя (см. план U13).
 */
import { Info } from "lucide-react";
import { Card } from "../../components/ui";
import { PageHeader } from "./shared";

const ROWS: { label: string; value: string }[] = [
  { label: "Название сайта", value: "SiGup — Северный Кавказ" },
  {
    label: "Описание",
    value: "Информационная площадка о черкесских товарах, услугах, предпринимателях и событиях по всему миру.",
  },
  { label: "Email", value: "info@sigup.ru" },
  { label: "Телефон", value: "+7 (938) 123-45-67" },
  { label: "Адрес", value: "Россия, г. Майкоп" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full">
      <title>Настройки сайта — админ-панель SiGup</title>
      <PageHeader title="Настройки сайта" subtitle="Основная информация и контакты, отображаемые на сайте" />

      <Card className="p-5 sm:p-6">
        <ul className="flex flex-col">
          {ROWS.map(({ label, value }) => (
            <li key={label} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-3.5 border-b border-line last:border-0">
              <span className="text-sm text-ink-faint">{label}</span>
              <span className="text-sm font-medium text-ink leading-relaxed">{value}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-start gap-3 bg-brand-muted border border-line rounded-md px-4 py-3.5">
        <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <p className="text-sm text-ink-soft leading-relaxed">
          Настройки сайта редактируются в конфигурации деплоя (<code className="text-ink">deploy/.env</code>).
          Управление этими полями из админ-панели появится в следующих версиях.
        </p>
      </div>
    </div>
  );
}

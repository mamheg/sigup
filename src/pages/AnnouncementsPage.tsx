import { Megaphone } from "lucide-react";
import { useStore } from "../lib/store";

export default function AnnouncementsPage() {
  const { announcements } = useStore();
  const visible = announcements.filter((a) => a.status === "Опубликовано");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <title>Объявления — SiGup</title>
      <meta name="description" content="Объявления черкесского сообщества: анонсы, новости и предложения." />

      <header className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Объявления</h1>
        <p className="mt-1 text-ink-soft">Анонсы, новости и предложения сообщества.</p>
      </header>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">Пока нет объявлений.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => (
            <article key={a.id} className="flex gap-3.5 bg-surface border border-line rounded-md shadow-card p-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-brand-muted flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-ink leading-relaxed">{a.text}</p>
                <p className="mt-1.5 text-xs text-ink-faint">{a.date}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

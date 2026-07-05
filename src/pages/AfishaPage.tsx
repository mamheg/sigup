import { CalendarDays, MapPin } from "lucide-react";
import { useStore } from "../lib/store";
import { Badge } from "../components/ui";

export default function AfishaPage() {
  const { events } = useStore();
  const visible = events.filter((e) => e.status === "Опубликовано");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <title>Афиша — SiGup</title>
      <meta name="description" content="Афиша событий, мероприятий и акций черкесского сообщества." />

      <header className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink">Афиша</h1>
        <p className="mt-1 text-ink-soft">События, мероприятия и акции сообщества.</p>
      </header>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">Пока нет опубликованных событий.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((e) => (
            <article
              key={e.id}
              className="bg-surface border border-line rounded-md shadow-card overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="aspect-[16/10] overflow-hidden bg-canvas">
                <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <Badge tone="brand">{e.type}</Badge>
                <h2 className="mt-2 font-serif text-xl text-ink leading-snug">{e.title}</h2>
                <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">{e.shortDescription}</p>
                <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-faint">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{e.dateStr}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{e.location}</span>
                </div>
                {e.link && (
                  <a
                    href={e.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-sm font-medium text-brand hover:underline"
                  >
                    Подробнее →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, RotateCcw } from "lucide-react";
import { api } from "../lib/api";
import { apiEventToEventItem } from "../lib/mappers";
import { EventItem } from "../types";
import { Badge, Button, Skeleton } from "../components/ui";

function EventCardSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-md overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function EventCard({ e, finished }: { e: EventItem; finished?: boolean }) {
  return (
    <article
      className={`bg-surface border border-line rounded-md shadow-card overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-pop ${
        finished ? "opacity-80" : ""
      }`}
    >
      <div className="aspect-[16/10] overflow-hidden bg-canvas">
        <img
          src={e.image}
          alt={e.title}
          loading="lazy"
          onError={(ev) => (ev.currentTarget.style.opacity = "0")}
          className={`w-full h-full object-cover img-outline ${finished ? "grayscale" : ""}`}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="brand">{e.type}</Badge>
          {finished && <Badge tone="neutral">Завершено</Badge>}
        </div>
        <h2 className="mt-2 font-serif text-xl text-ink leading-snug">{e.title}</h2>
        <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">{e.shortDescription}</p>
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-faint">
          {e.dateStr && (
            <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{e.dateStr}</span>
          )}
          {e.location && (
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{e.location}</span>
          )}
        </div>
        {e.link && !finished && (
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
  );
}

export default function AfishaPage() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setEvents(null);
    api.catalog
      .events()
      .then((list) => setEvents(list.map(apiEventToEventItem)))
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить афишу"));
  };

  useEffect(load, []);

  const upcoming = (events ?? []).filter((e) => e.status === "Опубликовано");
  const archive = (events ?? []).filter((e) => e.status === "Завершено");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <title>Афиша — SiGup</title>
      <meta name="description" content="Афиша событий, мероприятий и акций черкесского сообщества." />

      <header className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Афиша</h1>
        <p className="mt-1 text-ink-soft">События, мероприятия и акции сообщества.</p>
      </header>

      {error ? (
        <div className="py-20 text-center">
          <p className="text-ink-soft">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={load}>
            <RotateCcw className="w-4 h-4" /> Повторить
          </Button>
        </div>
      ) : events === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : upcoming.length === 0 && archive.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">Пока нет опубликованных событий.</p>
      ) : (
        <>
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {upcoming.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-ink-soft">Ближайших событий пока нет — загляните позже.</p>
          )}

          {archive.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl text-ink tracking-tight mb-5">Прошедшие события</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {archive.map((e) => (
                  <EventCard key={e.id} e={e} finished />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, ExternalLink, RotateCcw } from "lucide-react";
import { api } from "../lib/api";
import { apiEventToEventItem } from "../lib/mappers";
import { EventItem } from "../types";
import { paths } from "../lib/paths";
import { Badge, Button, Skeleton } from "../components/ui";

/**
 * Dedicated event page (`/afisha/:id`). Frontend-only: there is no public
 * single-event endpoint, so we fetch the published events list and select by id.
 * Mobile-first layout; graceful loading / not-found states.
 */
export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // undefined = loading · null = not found · EventItem = loaded
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setEvent(undefined);
    api.catalog
      .events()
      .then((list) => {
        const found = list.map(apiEventToEventItem).find((e) => e.id === id);
        setEvent(found ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить событие"));
  };

  useEffect(() => {
    load();
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const finished = event?.status === "Завершено";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <title>{event ? `${event.title} — Афиша SiGup` : "Афиша — SiGup"}</title>

      <button
        onClick={() => navigate(paths.afisha)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> К афише
      </button>

      {error ? (
        <div className="py-20 text-center">
          <p className="text-ink-soft">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={load}>
            <RotateCcw className="w-4 h-4" /> Повторить
          </Button>
        </div>
      ) : event === undefined ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[16/9] w-full rounded-lg" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : event === null ? (
        <div className="py-20 text-center">
          <p className="text-ink-soft">Событие не найдено или снято с публикации.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate(paths.afisha)}>
            К афише
          </Button>
        </div>
      ) : (
        <article>
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-canvas img-outline">
            <img
              src={event.image}
              alt={event.title}
              onError={(e) => (e.currentTarget.style.opacity = "0")}
              className={`w-full h-full object-cover ${finished ? "grayscale" : ""}`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-4">
            <Badge tone="brand">{event.type}</Badge>
            {finished && <Badge tone="neutral">Завершено</Badge>}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-ink leading-tight mt-2">{event.title}</h1>

          <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
            {event.dateStr && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gold shrink-0" />
                {event.dateStr}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                {event.location}
              </span>
            )}
          </div>

          {(event.fullDescription || event.shortDescription) && (
            <p className="mt-5 text-ink-soft leading-relaxed whitespace-pre-line">
              {event.fullDescription || event.shortDescription}
            </p>
          )}

          {event.link && !finished && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-sm bg-brand text-brand-fg text-sm font-medium hover:bg-brand-hover transition-colors"
            >
              Подробнее <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </article>
      )}
    </div>
  );
}

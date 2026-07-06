/**
 * Админ-дашборд по мокапу M3: 4 стат-карты, очередь модерации,
 * лента активности, ближайшие мероприятия, категории.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, CheckCircle2,
  Eye, EyeOff, FilePlus2, Hourglass, MapPin, PenLine, Pencil, UserPlus, Users, X, XCircle,
} from "lucide-react";
import {
  api, ApiCard, ApiCategory, ApiError, ApiEvent, ActivityItem, AdminStats,
} from "../../lib/api";
import { Badge, Card, Skeleton } from "../../components/ui";
import {
  CommentModal, EmptyState, ErrorState, EVENT_STATUS_RU, eventStatusTone, fmtDate,
  IconBtn, ModerationTable, PageHeader, relDate, SuccessNote, TableSkeleton, Thumb, ErrorNote,
} from "./shared";

const QUEUE_LIMIT = 5;
const ACTIVITY_LIMIT = 8;
const EVENTS_LIMIT = 3;

// ─── Лента активности: иконка и заголовок по kind ───

const ACTIVITY_META: Record<string, { Icon: typeof UserPlus; title: string }> = {
  user_registered: { Icon: UserPlus, title: "Новый пользователь" },
  card_created: { Icon: FilePlus2, title: "Новая карточка на модерации" },
  card_approved: { Icon: CheckCircle2, title: "Карточка одобрена" },
  card_rejected: { Icon: XCircle, title: "Карточка отклонена" },
  card_needs_revision: { Icon: PenLine, title: "Отправлена на доработку" },
  card_hidden: { Icon: EyeOff, title: "Карточка скрыта" },
  card_shown: { Icon: Eye, title: "Карточка снова опубликована" },
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const { Icon, title } = ACTIVITY_META[item.kind] ?? { Icon: Activity, title: "Событие" };
  return (
    <li className="flex items-start gap-3 py-3 border-b border-line last:border-0">
      <span className="w-9 h-9 rounded-full bg-brand-muted text-brand flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink leading-snug">{title}</p>
        <p className="text-sm text-ink-soft leading-snug mt-0.5 break-words">{item.text}</p>
      </div>
      <span className="text-xs text-ink-faint tabular whitespace-nowrap mt-0.5">{relDate(item.created_at)}</span>
    </li>
  );
}

// ─── «Ближайшие мероприятия»: published, ближайшие даты вперёд ───

function upcomingEvents(events: ApiEvent[]): ApiEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  const published = events.filter((e) => e.status === "published");
  const key = (e: ApiEvent) => e.date_start ?? "9999-12-31";
  const upcoming = published
    .filter((e) => (e.date_end ?? e.date_start ?? "9999") >= today)
    .sort((a, b) => key(a).localeCompare(key(b)));
  const past = published
    .filter((e) => (e.date_end ?? e.date_start ?? "9999") < today)
    .sort((a, b) => key(b).localeCompare(key(a)));
  return [...upcoming, ...past].slice(0, EVENTS_LIMIT);
}

const fmtEventDates = (e: ApiEvent) => {
  const f = (d?: string | null) =>
    d ? new Date(`${d}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
  if (!e.date_start) return "Дата уточняется";
  return e.date_end && e.date_end !== e.date_start ? `${f(e.date_start)} – ${f(e.date_end)}` : f(e.date_start);
};

// ─── Секция-обёртка с заголовком и ссылкой справа (композиция M3) ───

function Section({
  title,
  badge,
  linkTo,
  linkLabel,
  children,
}: {
  title: string;
  badge?: number;
  linkTo?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Card as="section" className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4 mb-4">
        <h2 className="font-serif text-xl sm:text-2xl text-ink flex items-center gap-2.5">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="min-w-6 h-6 px-1.5 rounded-full bg-gold/12 text-gold-dark text-xs font-semibold flex items-center justify-center tabular">
              {badge}
            </span>
          )}
        </h2>
        {linkTo && (
          <Link to={linkTo} className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            {linkLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<ApiCard[] | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [events, setEvents] = useState<ApiEvent[] | null>(null);
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<ApiCard | null>(null);

  const fetchAll = useCallback(async () => {
    const [s, p, a, e, c] = await Promise.all([
      api.admin.stats(),
      api.admin.cards("pending"),
      api.admin.activity(),
      api.admin.events(),
      api.catalog.categories(),
    ]);
    setStats(s);
    setPending(p);
    setActivity(a);
    setEvents(e);
    setCategories(c);
  }, []);

  const load = useCallback(() => {
    setLoadError(null);
    setStats(null);
    setPending(null);
    fetchAll().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Не удалось загрузить данные дашборда")
    );
  }, [fetchAll]);

  useEffect(load, [load]);

  /** После модерации обновляем данные без «мигания» скелетонами. */
  const refresh = useCallback(
    () => fetchAll().catch(() => {}),
    [fetchAll]
  );

  const approve = async (card: ApiCard) => {
    setBusyId(card.id);
    setActionError(null);
    setNote(null);
    try {
      await api.admin.approve(card.id);
      await refresh();
      setNote(`Карточка «${card.name}» опубликована.`);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Не удалось опубликовать карточку");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (card: ApiCard, comment: string) => {
    await api.admin.reject(card.id, comment);
    setRejecting(null);
    await refresh();
    setNote(`Карточка «${card.name}» отклонена.`);
  };

  const queue = useMemo(() => (pending ?? []).slice(0, QUEUE_LIMIT), [pending]);
  const loading = !loadError && (stats === null || pending === null);

  const statCards = stats
    ? [
        {
          label: "На проверке",
          value: stats.pending_cards,
          Icon: Hourglass,
          footer: (
            <Link to="/admin/moderation" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              Смотреть очередь <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ),
        },
        {
          label: "Опубликованные карточки",
          value: stats.published_cards,
          Icon: BookOpen,
          delta: stats.published_delta_7d,
        },
        {
          label: "Предприниматели",
          value: stats.entrepreneurs,
          Icon: Users,
          delta: stats.entrepreneurs_delta_7d,
        },
        {
          label: "Мероприятия",
          value: stats.events,
          Icon: CalendarDays,
          delta: stats.events_delta_7d,
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <title>Дашборд — админ-панель SiGup</title>
      <PageHeader title="Дашборд" subtitle="Обзор ключевых показателей и активности на платформе" />

      {note && <SuccessNote text={note} onClose={() => setNote(null)} />}
      {actionError && <ErrorNote text={actionError} onClose={() => setActionError(null)} />}

      {loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padded>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-16 mt-3" />
                <Skeleton className="h-4 w-24 mt-4" />
              </Card>
            ))}
          </div>
          <Card className="p-5 sm:p-6">
            <Skeleton className="h-7 w-44 mb-5" />
            <TableSkeleton />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 sm:p-6">
              <Skeleton className="h-7 w-52 mb-5" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-3" />
              ))}
            </Card>
            <Card className="p-5 sm:p-6">
              <Skeleton className="h-7 w-56 mb-5" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-3" />
              ))}
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* ── 4 стат-карты (M3) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, Icon, footer, delta }) => (
              <Card key={label} padded className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-brand-muted text-brand flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-ink-soft leading-tight">{label}</span>
                </div>
                <div className="font-sans text-4xl font-semibold text-ink tabular mt-3">{value}</div>
                <div className="mt-3 pt-3 border-t border-line min-h-9 flex items-center">
                  {footer ??
                    (delta !== undefined && delta > 0 ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 tabular">
                        +{delta} за неделю <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    ) : null)}
                </div>
              </Card>
            ))}
          </div>

          {/* ── Очередь модерации ── */}
          <Section
            title="На модерации"
            badge={stats?.pending_cards}
            linkTo="/admin/moderation"
            linkLabel="Перейти ко всей очереди"
          >
            {queue.length === 0 ? (
              <EmptyState text="Очередь пуста — все карточки проверены." />
            ) : (
              <ModerationTable
                cards={queue}
                actions={(c) => (
                  <>
                    <IconBtn title="Опубликовать" tone="brand" busy={busyId === c.id} onClick={() => approve(c)}>
                      <Check className="w-4 h-4" />
                    </IconBtn>
                    <IconBtn
                      title="Редактировать"
                      tone="gold"
                      disabled={busyId === c.id}
                      onClick={() => navigate(`/admin/cards?edit=${c.id}`)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </IconBtn>
                    <IconBtn title="Отклонить" tone="danger" disabled={busyId === c.id} onClick={() => setRejecting(c)}>
                      <X className="w-4 h-4" />
                    </IconBtn>
                  </>
                )}
              />
            )}
          </Section>

          {/* ── Активность + мероприятия/категории (две колонки M3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Section title="Недавняя активность">
              {(activity ?? []).length === 0 ? (
                <EmptyState text="Пока никакой активности — она появится после первых действий." />
              ) : (
                <ul>
                  {(activity ?? []).slice(0, ACTIVITY_LIMIT).map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </Section>

            <div className="flex flex-col gap-6">
              <Section title="Ближайшие мероприятия" linkTo="/admin/events" linkLabel="Перейти в афишу">
                {upcomingEvents(events ?? []).length === 0 ? (
                  <EmptyState text="Опубликованных мероприятий пока нет." />
                ) : (
                  <ul className="flex flex-col">
                    {upcomingEvents(events ?? []).map((e) => (
                      <li key={e.id} className="flex items-center gap-3.5 py-3 border-b border-line last:border-0">
                        <Thumb src={e.image_url} className="w-20 h-14" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{e.title}</p>
                          <p className="text-xs text-ink-soft mt-1 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-gold shrink-0" /> {fmtEventDates(e)}
                          </p>
                          {e.location && (
                            <p className="text-xs text-ink-faint mt-0.5 flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" /> {e.location}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge tone={eventStatusTone(e.status)}>{EVENT_STATUS_RU[e.status]}</Badge>
                          <IconBtn title="Редактировать" onClick={() => navigate(`/admin/events?edit=${e.id}`)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </IconBtn>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Категории" linkTo="/admin/categories" linkLabel="Управление категориями">
                {(categories ?? []).length === 0 ? (
                  <EmptyState text="Категории ещё не созданы." />
                ) : (
                  <ul>
                    <li className="flex items-center justify-between pb-2 border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
                      <span>Категория</span>
                      <span>Карточек</span>
                    </li>
                    {(categories ?? []).map((c) => (
                      <li key={c.id} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                        <span className="text-sm font-medium text-ink">{c.name}</span>
                        <span className="text-sm text-ink-soft tabular">{c.cards_count ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </div>
        </>
      )}

      {/* ── Модал отклонения ── */}
      <CommentModal
        open={!!rejecting}
        title="Отклонить карточку"
        description={
          <>
            Карточка «{rejecting?.name}» будет отклонена. Комментарий увидит предприниматель в личном кабинете.
          </>
        }
        submitLabel="Отклонить"
        onClose={() => setRejecting(null)}
        onSubmit={(comment) => (rejecting ? reject(rejecting, comment) : Promise.resolve())}
      />
    </div>
  );
}

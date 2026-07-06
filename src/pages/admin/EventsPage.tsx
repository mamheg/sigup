/**
 * Афиша: список всех событий + одна форма-модал на создание и правку,
 * удаление с подтверждением.
 */
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { api, ApiError, ApiEvent, EventStatus } from "../../lib/api";
import { Badge, Button, Card, Input, Modal, Select, Textarea } from "../../components/ui";
import {
  EmptyState, ErrorNote, ErrorState, EVENT_STATUS_RU, EVENT_TYPE_RU, eventStatusTone,
  hideBroken, IconBtn, PageHeader, SuccessNote, TableSkeleton, Thumb,
} from "./shared";
import { mediaUrl } from "../../lib/media";

const fmtEventDates = (e: ApiEvent) => {
  const f = (d?: string | null) =>
    d ? new Date(`${d}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
  if (!e.date_start) return "—";
  return e.date_end && e.date_end !== e.date_start ? `${f(e.date_start)} – ${f(e.date_end)}` : f(e.date_start);
};

// ─── Единая форма создания/правки события ───

interface EventForm {
  title: string;
  type: string;
  image_url: string;
  date_start: string;
  date_end: string;
  location: string;
  description: string;
  link: string;
  status: EventStatus;
  is_featured: boolean;
}

const EMPTY_FORM: EventForm = {
  title: "",
  type: "event",
  image_url: "",
  date_start: "",
  date_end: "",
  location: "",
  description: "",
  link: "",
  status: "draft",
  is_featured: false,
};

const toForm = (e: ApiEvent): EventForm => ({
  title: e.title,
  type: e.type,
  image_url: e.image_url ?? "",
  date_start: e.date_start ?? "",
  date_end: e.date_end ?? "",
  location: e.location ?? "",
  description: e.description ?? "",
  link: e.link ?? "",
  status: e.status,
  is_featured: e.is_featured,
});

function EventFormModal({
  open,
  event,
  onClose,
  onSaved,
}: {
  open: boolean;
  event: ApiEvent | null; // null = создание
  onClose: () => void;
  onSaved: (saved: ApiEvent, created: boolean) => void;
}) {
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(event ? toForm(event) : EMPTY_FORM);
      setError(null);
      setBusy(false);
    }
  }, [open, event]);

  const set = <K extends keyof EventForm>(key: K, value: EventForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      setError("Укажите название события.");
      return;
    }
    setBusy(true);
    setError(null);
    const opt = (v: string) => v.trim() || null;
    const payload = {
      title: form.title.trim(),
      type: form.type,
      image_url: opt(form.image_url),
      date_start: form.date_start || null,
      date_end: form.date_end || null,
      location: opt(form.location),
      description: opt(form.description),
      link: opt(form.link),
      status: form.status,
      is_featured: form.is_featured,
    };
    try {
      const saved = event
        ? await api.admin.updateEvent(event.id, payload)
        : await api.admin.createEvent(payload);
      onSaved(saved, !event);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить событие");
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => (busy ? undefined : onClose())}
      title={event ? `Редактирование: ${event.title}` : "Новое событие"}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {event ? "Сохранить" : "Создать"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Название" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <Select label="Тип" value={form.type} onChange={(e) => set("type", e.target.value)}>
            {Object.entries(EVENT_TYPE_RU).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Input
            label="Ссылка на изображение"
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="https://… или /static/uploads/…"
          />
          {form.image_url.trim() && (
            <div className="mt-2.5 w-full max-w-xs aspect-video rounded-sm bg-canvas overflow-hidden img-outline">
              <img
                key={form.image_url}
                src={mediaUrl(form.image_url.trim())}
                alt="Предпросмотр изображения"
                onError={hideBroken}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Дата начала" type="date" value={form.date_start} onChange={(e) => set("date_start", e.target.value)} />
          <Input label="Дата окончания" type="date" value={form.date_end} onChange={(e) => set("date_end", e.target.value)} />
        </div>
        <Input label="Место проведения" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Например: Майкоп, Адыгея" />
        <Textarea label="Описание" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Ссылка (подробнее / регистрация)" value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://…" />
          <Select label="Статус" value={form.status} onChange={(e) => set("status", e.target.value as EventStatus)}>
            {Object.entries(EVENT_STATUS_RU).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => set("is_featured", e.target.checked)}
            className="w-4 h-4 accent-brand"
          />
          <span className="text-sm text-ink">Показывать в карусели на главной</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}

// ─── Страница ───

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<ApiEvent[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiEvent | null>(null);
  const [deleting, setDeleting] = useState<ApiEvent | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchEvents = useCallback(() => api.admin.events().then(setEvents), []);

  const load = useCallback(() => {
    setLoadError(null);
    setEvents(null);
    fetchEvents().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Не удалось загрузить события")
    );
  }, [fetchEvents]);

  useEffect(load, [load]);

  // Deep-link с дашборда: /admin/events?edit=<id>
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || events === null) return;
    const target = events.find((e) => e.id === Number(editId));
    if (target) {
      setEditing(target);
      setFormOpen(true);
    }
    setSearchParams({}, { replace: true });
  }, [events, searchParams, setSearchParams]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (e: ApiEvent) => {
    setEditing(e);
    setFormOpen(true);
  };

  const onSaved = async (saved: ApiEvent, created: boolean) => {
    setFormOpen(false);
    setEditing(null);
    await fetchEvents().catch(() => {});
    setNote(created ? `Событие «${saved.title}» создано.` : `Событие «${saved.title}» сохранено.`);
  };

  const toggleFeatured = async (e: ApiEvent) => {
    setBusyId(e.id);
    setActionError(null);
    try {
      const updated = await api.admin.updateEvent(e.id, { is_featured: !e.is_featured });
      setEvents((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)) : prev));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Не удалось изменить событие");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setActionError(null);
    try {
      await api.admin.deleteEvent(deleting.id);
      setEvents((prev) => (prev ? prev.filter((e) => e.id !== deleting.id) : prev));
      setNote(`Событие «${deleting.title}» удалено.`);
      setDeleting(null);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Не удалось удалить событие");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <title>Афиша — админ-панель SiGup</title>
      <PageHeader
        title="Афиша"
        subtitle="Мероприятия, акции и объявления платформы"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Добавить
          </Button>
        }
      />

      {note && <SuccessNote text={note} onClose={() => setNote(null)} />}
      {actionError && <ErrorNote text={actionError} onClose={() => setActionError(null)} />}

      <Card className="p-5 sm:p-6">
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : events === null ? (
          <TableSkeleton rows={5} />
        ) : events.length === 0 ? (
          <EmptyState text="Событий пока нет — добавьте первое.">
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Добавить событие
            </Button>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
                  <th className="pb-3 pr-4 font-semibold">Событие</th>
                  <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Тип</th>
                  <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Даты</th>
                  <th className="pb-3 pr-4 font-semibold">Статус</th>
                  <th className="pb-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <Thumb src={e.image_url} className="w-16 h-11" />
                        <span className="font-medium text-ink truncate max-w-[220px] block">{e.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-ink-soft hidden sm:table-cell">
                      {EVENT_TYPE_RU[e.type] ?? e.type}
                    </td>
                    <td className="py-3.5 pr-4 text-ink-soft tabular hidden md:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-gold shrink-0" />
                        {fmtEventDates(e)}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge tone={eventStatusTone(e.status)}>{EVENT_STATUS_RU[e.status]}</Badge>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconBtn
                          title={e.is_featured ? "Убрать из карусели" : "В карусель на главной"}
                          tone={e.is_featured ? "gold" : "neutral"}
                          busy={busyId === e.id}
                          onClick={() => toggleFeatured(e)}
                        >
                          <Star className={`w-3.5 h-3.5 ${e.is_featured ? "fill-gold text-gold" : ""}`} />
                        </IconBtn>
                        <IconBtn title="Редактировать" disabled={busyId === e.id} onClick={() => openEdit(e)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </IconBtn>
                        <IconBtn title="Удалить" tone="danger" disabled={busyId === e.id} onClick={() => setDeleting(e)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EventFormModal
        open={formOpen}
        event={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={onSaved}
      />

      {/* ── Подтверждение удаления ── */}
      <Modal
        open={!!deleting}
        onClose={() => (deleteBusy ? undefined : setDeleting(null))}
        size="sm"
        title="Удалить событие?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={deleteBusy}>
              Отмена
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Удалить
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft leading-relaxed">
          Событие «{deleting?.title}» будет удалено навсегда. Это действие нельзя отменить.
        </p>
      </Modal>
    </div>
  );
}

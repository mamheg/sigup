/**
 * Все карточки каталога: фильтр по статусам, поиск по названию,
 * featured-звезда, скрыть/показать, правка админом (статус не меняется).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Pencil, Search, Star } from "lucide-react";
import { api, ApiCard, ApiCategory, ApiError, CardStatus } from "../../lib/api";
import { Button, Card, Chip, Input, Modal, Select, Textarea } from "../../components/ui";
import {
  CardStatusBadge, EmptyState, ErrorNote, ErrorState, fmtDate, IconBtn,
  PageHeader, SuccessNote, TableSkeleton, Thumb,
} from "./shared";

type Filter = "all" | CardStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "published", label: "Опубликованные" },
  { key: "hidden", label: "Скрытые" },
  { key: "draft", label: "Черновики" },
  { key: "pending", label: "На проверке" },
  { key: "rejected", label: "Отклонённые" },
  { key: "needs_revision", label: "Требуют доработки" },
];

// ─── Модал правки карточки админом ───

interface FormState {
  name: string;
  category_id: string;
  short_description: string;
  full_description: string;
  city: string;
  country: string;
  instagram: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  website: string;
  price_info: string;
  delivery_info: string;
}

const toForm = (c: ApiCard): FormState => ({
  name: c.name,
  category_id: String(c.category_id),
  short_description: c.short_description,
  full_description: c.full_description ?? "",
  city: c.city ?? "",
  country: c.country ?? "",
  instagram: c.instagram ?? "",
  phone: c.phone ?? "",
  whatsapp: c.whatsapp ?? "",
  telegram: c.telegram ?? "",
  website: c.website ?? "",
  price_info: c.price_info ?? "",
  delivery_info: c.delivery_info ?? "",
});

function CardEditModal({
  card,
  categories,
  onClose,
  onSaved,
}: {
  card: ApiCard | null;
  categories: ApiCategory[];
  onClose: () => void;
  onSaved: (updated: ApiCard) => void;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(card ? toForm(card) : null);
    setError(null);
    setBusy(false);
  }, [card]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => (f ? { ...f, [key]: e.target.value } : f));

  const save = async () => {
    if (!card || !form) return;
    if (!form.name.trim() || !form.short_description.trim()) {
      setError("Название и краткое описание обязательны.");
      return;
    }
    setBusy(true);
    setError(null);
    const opt = (v: string) => v.trim() || null;
    try {
      const updated = await api.admin.updateCard(card.id, {
        name: form.name.trim(),
        category_id: Number(form.category_id),
        short_description: form.short_description.trim(),
        full_description: opt(form.full_description),
        city: opt(form.city),
        country: opt(form.country),
        instagram: opt(form.instagram),
        phone: opt(form.phone),
        whatsapp: opt(form.whatsapp),
        telegram: opt(form.telegram),
        website: opt(form.website),
        price_info: opt(form.price_info),
        delivery_info: opt(form.delivery_info),
      });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить карточку");
      setBusy(false);
    }
  };

  return (
    <Modal
      open={!!card}
      onClose={() => (busy ? undefined : onClose())}
      title={`Редактирование: ${card?.name ?? ""}`}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs text-ink-faint flex-1">
            Правка администратора не меняет статус карточки.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Отмена
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </div>
      }
    >
      {form && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Название" value={form.name} onChange={set("name")} />
            <Select label="Категория" value={form.category_id} onChange={set("category_id")}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <Textarea label="Краткое описание" rows={2} value={form.short_description} onChange={set("short_description")} />
          <Textarea label="Полное описание" rows={5} value={form.full_description} onChange={set("full_description")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Город" value={form.city} onChange={set("city")} />
            <Input label="Страна" value={form.country} onChange={set("country")} />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-ink mb-2">Контакты</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Телефон" value={form.phone} onChange={set("phone")} placeholder="+7 …" />
              <Input label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} />
              <Input label="Telegram" value={form.telegram} onChange={set("telegram")} placeholder="@username" />
              <Input label="Instagram" value={form.instagram} onChange={set("instagram")} placeholder="@username" />
              <Input label="Сайт" value={form.website} onChange={set("website")} placeholder="https://…" className="sm:col-span-2" />
            </div>
          </fieldset>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea label="Цены" rows={2} value={form.price_info} onChange={set("price_info")} />
            <Textarea label="Доставка" rows={2} value={form.delivery_info} onChange={set("delivery_info")} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

// ─── Страница ───

export default function CardsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cards, setCards] = useState<ApiCard[] | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ApiCard | null>(null);

  const load = useCallback(() => {
    setLoadError(null);
    setCards(null);
    Promise.all([api.admin.cards("all"), api.catalog.categories()])
      .then(([cs, cats]) => {
        setCards(cs);
        setCategories(cats);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Не удалось загрузить карточки"));
  }, []);

  useEffect(load, [load]);

  // Deep-link с дашборда: /admin/cards?edit=<id> открывает модал правки.
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || cards === null) return;
    const target = cards.find((c) => c.id === Number(editId));
    if (target) setEditing(target);
    setSearchParams({}, { replace: true });
  }, [cards, searchParams, setSearchParams]);

  const counts = useMemo(() => {
    const all = cards ?? [];
    const result = { all: all.length } as Record<Filter, number>;
    for (const { key } of FILTERS) {
      if (key !== "all") result[key] = all.filter((c) => c.status === key).length;
    }
    return result;
  }, [cards]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (cards ?? [])
      .filter((c) => filter === "all" || c.status === filter)
      .filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [cards, filter, query]);

  const patchLocal = (updated: ApiCard) =>
    setCards((prev) => (prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : prev));

  const runRowAction = async (card: ApiCard, fn: () => Promise<ApiCard>, doneText: string) => {
    setBusyId(card.id);
    setActionError(null);
    setNote(null);
    try {
      patchLocal(await fn());
      setNote(doneText);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Не удалось выполнить действие");
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisibility = (c: ApiCard) =>
    runRowAction(
      c,
      () => (c.status === "published" ? api.admin.hide(c.id) : api.admin.show(c.id)),
      c.status === "published" ? `Карточка «${c.name}» скрыта с сайта.` : `Карточка «${c.name}» снова на сайте.`
    );

  const toggleFeatured = (c: ApiCard) =>
    runRowAction(
      c,
      () => api.admin.updateCard(c.id, { is_featured: !c.is_featured }),
      !c.is_featured
        ? `Карточка «${c.name}» добавлена в рекомендуемые.`
        : `Карточка «${c.name}» убрана из рекомендуемых.`
    );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <title>Карточки каталога — админ-панель SiGup</title>
      <PageHeader title="Карточки каталога" subtitle="Все карточки платформы: правка, видимость и рекомендуемые" />

      {note && <SuccessNote text={note} onClose={() => setNote(null)} />}
      {actionError && <ErrorNote text={actionError} onClose={() => setActionError(null)} />}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          {FILTERS.map(({ key, label }) => (
            <Chip key={key} active={filter === key} onClick={() => setFilter(key)}>
              {label}
              {cards !== null && (
                <span className={`ml-1.5 tabular text-xs ${filter === key ? "text-brand-fg/80" : "text-ink-faint"}`}>
                  {counts[key] ?? 0}
                </span>
              )}
            </Chip>
          ))}
        </div>
        <div className="relative lg:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию…"
            className="pl-9"
            aria-label="Поиск по названию"
          />
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : cards === null ? (
          <TableSkeleton rows={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            text={query.trim() ? "Ничего не найдено — попробуйте изменить запрос." : "В этом статусе карточек нет."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
                  <th className="pb-3 pr-4 font-semibold">Карточка</th>
                  <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Категория</th>
                  <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Автор</th>
                  <th className="pb-3 pr-4 font-semibold hidden lg:table-cell">Обновлено</th>
                  <th className="pb-3 pr-4 font-semibold">Статус</th>
                  <th className="pb-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <Thumb src={c.photos[0]?.thumb_url ?? c.photos[0]?.url} />
                        <span className="font-medium text-ink truncate max-w-[180px] block">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-ink-soft hidden sm:table-cell">{c.category_name ?? "—"}</td>
                    <td className="py-3.5 pr-4 text-ink-soft hidden md:table-cell truncate max-w-[160px]">
                      {c.owner_name ?? "—"}
                    </td>
                    <td className="py-3.5 pr-4 text-ink-faint tabular hidden lg:table-cell whitespace-nowrap">
                      {fmtDate(c.updated_at)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <CardStatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconBtn
                          title={c.is_featured ? "Убрать из рекомендуемых" : "В рекомендуемые"}
                          tone={c.is_featured ? "gold" : "neutral"}
                          busy={busyId === c.id}
                          onClick={() => toggleFeatured(c)}
                        >
                          <Star className={`w-3.5 h-3.5 ${c.is_featured ? "fill-gold text-gold" : ""}`} />
                        </IconBtn>
                        {(c.status === "published" || c.status === "hidden") && (
                          <IconBtn
                            title={c.status === "published" ? "Скрыть с сайта" : "Показать на сайте"}
                            busy={busyId === c.id}
                            onClick={() => toggleVisibility(c)}
                          >
                            {c.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </IconBtn>
                        )}
                        <IconBtn title="Редактировать" disabled={busyId === c.id} onClick={() => setEditing(c)}>
                          <Pencil className="w-3.5 h-3.5" />
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

      <CardEditModal
        card={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          patchLocal(updated);
          setEditing(null);
          setNote(`Карточка «${updated.name}» сохранена.`);
        }}
      />
    </div>
  );
}

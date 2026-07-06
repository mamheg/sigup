import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Plus, Edit3, Eye, Trash2, Bell, CheckCircle2, XCircle, Clock,
  FileText, LayoutGrid, LogOut, Inbox, Home, Settings, Store, Loader2,
  RotateCcw, AlertTriangle, Check,
} from "lucide-react";
import { api, ApiCard, ApiError, CardStatus } from "../lib/api";
import { STATUS_EN_RU } from "../lib/mappers";
import { mediaUrl } from "../lib/media";
import { useAuth } from "../lib/auth";
import { paths } from "../lib/paths";
import { Button, Input, Badge, Modal, Skeleton } from "./ui";

const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

const statusTone = (status: CardStatus): "success" | "warning" | "danger" | "neutral" => {
  if (status === "published") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "needs_revision") return "danger";
  return "neutral";
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

const withinLastMonth = (iso: string) => Date.now() - new Date(iso).getTime() < 30 * 24 * 3600 * 1000;

type Section = "overview" | "cards" | "settings";
type StatusFilter = "all" | "draft" | "pending" | "published" | "rejected";

const FILTER_TITLES: Record<StatusFilter, string> = {
  all: "Мои карточки",
  draft: "Черновики",
  pending: "На проверке",
  published: "Опубликованные",
  rejected: "Отклонённые",
};

const matchesFilter = (c: ApiCard, f: StatusFilter) => {
  if (f === "all") return true;
  if (f === "rejected") return c.status === "rejected" || c.status === "needs_revision";
  return c.status === f;
};

// ─── Cards table (M2: thumb · name · category · location · updated · status · actions) ───
function CardsTable({
  cards,
  onDelete,
}: {
  cards: ApiCard[];
  onDelete: (card: ApiCard) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
            <th className="pb-3 pr-4 font-semibold">Название</th>
            <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Категория</th>
            <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Локация</th>
            <th className="pb-3 pr-4 font-semibold hidden lg:table-cell">Обновлено</th>
            <th className="pb-3 pr-4 font-semibold">Статус</th>
            <th className="pb-3 text-right font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id} id={`cabinet-row-${c.id}`} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-canvas overflow-hidden shrink-0 img-outline">
                    {c.photos[0] && (
                      <img src={mediaUrl(c.photos[0].thumb_url ?? c.photos[0].url)} alt="" onError={hideBroken} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-ink truncate max-w-[160px] block">{c.name}</span>
                </div>
              </td>
              <td className="py-4 pr-4 text-ink-soft hidden sm:table-cell">{c.category_name ?? "—"}</td>
              <td className="py-4 pr-4 text-ink-soft truncate hidden md:table-cell">
                {[c.city, c.country].filter(Boolean).join(", ") || "—"}
              </td>
              <td className="py-4 pr-4 text-ink-faint tabular hidden lg:table-cell">{fmtDate(c.updated_at)}</td>
              <td className="py-4 pr-4">
                <Badge tone={statusTone(c.status)}>{STATUS_EN_RU[c.status]}</Badge>
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => navigate(`/cabinet/edit/${c.id}`)}
                    title="Редактировать"
                    className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-brand hover:border-line-strong transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {c.status === "published" && (
                    <button
                      onClick={() => navigate(paths.project(c.slug))}
                      title="Посмотреть на сайте"
                      className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-brand hover:border-line-strong transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(c)}
                    title="Удалить"
                    className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Profile settings form (PATCH /cabinet/profile; email read-only) ───
function ProfileSettings() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.cabinet.updateProfile({ name, phone, city, country });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="ФИО" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя и фамилия" />
        <Input label="Телефон" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
        <Input label="Город" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Например: Майкоп" />
        <Input label="Страна" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Например: Россия" />
      </div>
      <Input label="Email" value={user?.email ?? ""} readOnly disabled className="opacity-70" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Сохранить
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" /> Сохранено
          </span>
        )}
      </div>
    </form>
  );
}

export default function EntrepreneurCabinet() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [cards, setCards] = useState<ApiCard[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAllRows, setShowAllRows] = useState(false);
  const [deleting, setDeleting] = useState<ApiCard | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = () => {
    setLoadError(null);
    setCards(null);
    api.cabinet
      .myCards()
      .then(setCards)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Не удалось загрузить карточки"));
  };
  useEffect(load, []);

  const all = cards ?? [];
  const counts = useMemo(
    () => ({
      all: all.length,
      draft: all.filter((c) => c.status === "draft").length,
      pending: all.filter((c) => c.status === "pending").length,
      published: all.filter((c) => c.status === "published").length,
      rejected: all.filter((c) => c.status === "rejected" || c.status === "needs_revision").length,
      needsRevision: all.filter((c) => c.status === "needs_revision").length,
    }),
    [all]
  );

  // Deltas «за месяц» — honest client-side computation from created_at/updated_at.
  const deltas = useMemo(() => {
    const createdRecently = all.filter((c) => withinLastMonth(c.created_at)).length;
    const publishedRecently = all.filter((c) => c.status === "published" && withinLastMonth(c.updated_at)).length;
    const fmt = (n: number) => (n > 0 ? `+${n} за последний месяц` : "без изменений");
    return { total: fmt(createdRecently), published: fmt(publishedRecently) };
  }, [all]);

  const notifications = useMemo(
    () => all.filter((c) => c.status === "rejected" || c.status === "needs_revision"),
    [all]
  );

  const filtered = useMemo(() => all.filter((c) => matchesFilter(c, statusFilter)), [all, statusFilter]);
  const ROWS_CAP = 5;
  const rows = showAllRows ? filtered : filtered.slice(0, ROWS_CAP);
  const hiddenRows = filtered.length - rows.length;

  // Profile completeness: name / phone / city / country / has ≥1 card, 20% each.
  const completenessChecks: { label: string; done: boolean }[] = [
    { label: "ФИО", done: !!user?.name },
    { label: "Телефон", done: !!user?.phone },
    { label: "Город", done: !!user?.city },
    { label: "Страна", done: !!user?.country },
    { label: "Есть карточка", done: all.length > 0 },
  ];
  const completeness = Math.round((completenessChecks.filter((c) => c.done).length / completenessChecks.length) * 100);

  const initial = (user?.name ?? "?").trim().slice(0, 1).toUpperCase();
  const location = [user?.city, user?.country].filter(Boolean).join(", ");

  const selectFilter = (f: StatusFilter) => {
    setStatusFilter(f);
    setSection("cards");
    setShowAllRows(true);
  };

  const goOverview = () => {
    setSection("overview");
    setStatusFilter("all");
    setShowAllRows(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate(paths.home);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.cabinet.deleteCard(deleting.id);
      setCards((prev) => (prev ? prev.filter((c) => c.id !== deleting.id) : prev));
      setDeleting(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Не удалось удалить карточку");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  // ─── Sidebar nav (M2) ───
  const navMain = [
    { key: "overview" as const, label: "Обзор", Icon: Home, active: section === "overview", onClick: goOverview },
    { key: "cards" as const, label: "Мои карточки", Icon: LayoutGrid, count: counts.all, active: section === "cards" && statusFilter === "all", onClick: () => selectFilter("all") },
    { key: "create" as const, label: "Создать карточку", Icon: Plus, active: false, onClick: () => navigate(paths.create) },
    { key: "draft" as const, label: "Черновики", Icon: FileText, count: counts.draft, active: section === "cards" && statusFilter === "draft", onClick: () => selectFilter("draft") },
    { key: "pending" as const, label: "На проверке", Icon: Clock, count: counts.pending, active: section === "cards" && statusFilter === "pending", onClick: () => selectFilter("pending") },
    { key: "published" as const, label: "Опубликованные", Icon: CheckCircle2, count: counts.published, active: section === "cards" && statusFilter === "published", onClick: () => selectFilter("published") },
    { key: "rejected" as const, label: "Отклонённые", Icon: XCircle, count: counts.rejected, active: section === "cards" && statusFilter === "rejected", onClick: () => selectFilter("rejected") },
  ];

  const stats: { label: string; value: number; delta: string; Icon: typeof Clock; valueClass: string }[] = [
    { label: "Всего карточек", value: counts.all, delta: deltas.total, Icon: LayoutGrid, valueClass: "text-brand" },
    { label: "Опубликовано", value: counts.published, delta: deltas.published, Icon: CheckCircle2, valueClass: "text-green-700" },
    { label: "На проверке", value: counts.pending, delta: counts.pending > 0 ? "ожидают модерации" : "без изменений", Icon: Clock, valueClass: "text-amber-600" },
    { label: "Требуют доработки", value: counts.needsRevision, delta: counts.needsRevision > 0 ? "нужны правки" : "без изменений", Icon: AlertTriangle, valueClass: "text-red-600" },
  ];

  const cardsPanel = (
    <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">{FILTER_TITLES[statusFilter]}</h2>
          <p className="text-sm text-ink-soft mt-0.5">Изменения появляются в каталоге после модерации.</p>
        </div>
        <Button id="cabinet-create-card-btn" onClick={() => navigate(paths.create)} className="shrink-0">
          <Plus className="w-4 h-4" /> Создать новую карточку
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-md border border-dashed border-line bg-canvas">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
          <p className="text-sm text-ink-soft">
            {statusFilter === "all" ? "У вас пока нет карточек — создайте первую." : "В этом статусе пока нет карточек."}
          </p>
          {statusFilter === "all" && (
            <Button size="sm" className="mt-4" onClick={() => navigate(paths.create)}>
              <Plus className="w-4 h-4" /> Создать карточку
            </Button>
          )}
        </div>
      ) : (
        <>
          <CardsTable cards={rows} onDelete={setDeleting} />
          {hiddenRows > 0 && (
            <div className="flex justify-center mt-5">
              <Button variant="secondary" size="sm" onClick={() => setShowAllRows(true)}>
                Показать ещё {hiddenRows} {hiddenRows === 1 ? "карточку" : hiddenRows < 5 ? "карточки" : "карточек"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-canvas py-8 sm:py-12 min-h-screen">
      <title>Личный кабинет — SiGup</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT: profile + nav (M2 sidebar) ── */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-line rounded-lg shadow-card p-6 lg:sticky lg:top-24">
              <div className="flex flex-col items-center text-center pb-6 border-b border-line">
                <div className="w-20 h-20 rounded-full bg-brand text-brand-fg flex items-center justify-center font-serif text-4xl mb-3.5 select-none">
                  {initial}
                </div>
                <h3 className="font-serif text-xl text-ink leading-tight">{user?.name}</h3>
                <span className="text-[11px] font-semibold text-gold-dark uppercase tracking-widest mt-1">
                  Предприниматель
                </span>
                {location && (
                  <span className="text-sm text-ink-soft mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {location}
                  </span>
                )}
              </div>

              <nav className="flex flex-row lg:flex-col gap-1.5 mt-6 overflow-x-auto lg:overflow-visible scrollbar-none pb-1 lg:pb-0">
                {navMain.map(({ key, label, Icon, count, active, onClick }) => (
                  <button
                    key={key}
                    onClick={onClick}
                    className={`shrink-0 lg:w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                      active
                        ? "bg-brand text-brand-fg"
                        : "text-ink-soft hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </span>
                    {count !== undefined && count > 0 && (
                      <span
                        className={`tabular text-xs px-2 py-0.5 rounded-full ${
                          active ? "bg-white/15 text-brand-fg" : "bg-canvas text-ink-faint"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}

                <div className="hidden lg:block border-t border-line my-2.5" />

                <button
                  onClick={() => setSection("settings")}
                  className={`shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                    section === "settings" ? "bg-brand text-brand-fg" : "text-ink-soft hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  Настройки профиля
                </button>
                <button
                  onClick={handleLogout}
                  className="shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-sm font-medium text-ink-soft hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Выйти
                </button>
              </nav>
            </div>
          </div>

          {/* ── RIGHT: main ── */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Личный кабинет</h1>
              <p className="text-lg font-medium text-ink mt-2">Здравствуйте, {user?.name}</p>
              <p className="text-ink-soft mt-1 max-w-xl leading-relaxed">
                Здесь вы можете управлять своими проектами и следить за их статусом.
              </p>
            </div>

            {loadError ? (
              <div className="bg-surface border border-line rounded-lg shadow-card p-10 text-center">
                <p className="text-ink-soft">{loadError}</p>
                <Button variant="secondary" className="mt-4" onClick={load}>
                  <RotateCcw className="w-4 h-4" /> Повторить
                </Button>
              </div>
            ) : cards === null ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-surface border border-line rounded-md p-5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-9 w-14 mt-3" />
                      <Skeleton className="h-3 w-28 mt-2.5" />
                    </div>
                  ))}
                </div>
                <div className="bg-surface border border-line rounded-lg p-6 sm:p-8 flex flex-col gap-4">
                  <Skeleton className="h-7 w-44" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </>
            ) : section === "settings" ? (
              <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8 max-w-2xl">
                <div className="flex items-center gap-2.5 border-b border-line pb-4 mb-6">
                  <Settings className="w-4 h-4 text-gold" />
                  <h2 className="font-serif text-2xl text-ink">Настройки аккаунта</h2>
                </div>
                <ProfileSettings />
              </div>
            ) : section === "cards" ? (
              cardsPanel
            ) : (
              <>
                {/* ── Stats (M2: 4 cards with icon, value, delta) ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map(({ label, value, delta, Icon, valueClass }) => (
                    <div key={label} className="bg-surface border border-line rounded-md shadow-sm p-5">
                      <div className="flex items-center gap-2 text-ink-faint">
                        <Icon className="w-4 h-4 text-gold" />
                        <span className="text-xs uppercase tracking-wider">{label}</span>
                      </div>
                      <div className={`font-serif text-3xl mt-2 tabular ${valueClass}`}>{value}</div>
                      <p className="text-xs text-ink-faint mt-1.5">{delta}</p>
                    </div>
                  ))}
                </div>

                {cardsPanel}

                {/* ── Notifications + account (M2 bottom row) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface border border-line rounded-lg shadow-card p-6">
                    <div className="flex items-center gap-2.5 border-b border-line pb-3.5 mb-4">
                      <Bell className="w-4 h-4 text-gold" />
                      <h3 className="font-serif text-lg text-ink">Уведомления модерации</h3>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center text-center py-8 text-ink-faint">
                        <Inbox className="w-8 h-8 mb-2" />
                        <p className="text-sm text-ink-soft">Нет карточек, требующих внимания.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {notifications.map((c) => (
                          <div key={c.id} className="bg-canvas border border-line rounded-md p-4 flex gap-3">
                            <span
                              className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                c.status === "rejected" ? "bg-red-500" : "bg-amber-500"
                              }`}
                            />
                            <div className="flex-grow">
                              <h4 className="text-sm font-semibold text-ink">
                                Карточка «{c.name}» {c.status === "rejected" ? "отклонена" : "требует доработки"}
                              </h4>
                              <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                                {c.admin_comment || "Внесите изменения и отправьте карточку на повторную проверку."}
                              </p>
                              <p className="text-xs text-ink-faint mt-1.5 tabular">{fmtDate(c.updated_at)}</p>
                              <div className="mt-3">
                                <Button size="sm" variant="secondary" onClick={() => navigate(`/cabinet/edit/${c.id}`)}>
                                  Перейти к карточке
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-surface border border-line rounded-lg shadow-card p-6 flex flex-col">
                    <div className="flex items-center justify-between gap-2.5 border-b border-line pb-3.5 mb-4">
                      <div className="flex items-center gap-2.5">
                        <Settings className="w-4 h-4 text-gold" />
                        <h3 className="font-serif text-lg text-ink">Настройки аккаунта</h3>
                      </div>
                      <button onClick={() => setSection("settings")} className="text-xs font-medium text-brand hover:underline">
                        Изменить
                      </button>
                    </div>

                    <ul className="flex flex-col gap-2.5 text-sm">
                      <li className="flex justify-between gap-3">
                        <span className="text-ink-faint">ФИО</span>
                        <span className="font-medium text-ink text-right">{user?.name || "—"}</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span className="text-ink-faint">Телефон</span>
                        <span className="font-medium text-ink text-right tabular">{user?.phone || "—"}</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span className="text-ink-faint">Email</span>
                        <span className="font-medium text-ink text-right">{user?.email}</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span className="text-ink-faint">Локация</span>
                        <span className="font-medium text-ink text-right">{location || "—"}</span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span className="text-ink-faint">Тип аккаунта</span>
                        <span className="font-medium text-ink text-right">Предприниматель</span>
                      </li>
                      {user?.created_at && (
                        <li className="flex justify-between gap-3">
                          <span className="text-ink-faint">Дата регистрации</span>
                          <span className="font-medium text-ink text-right tabular">{fmtDate(user.created_at)}</span>
                        </li>
                      )}
                    </ul>

                    <div className="mt-auto pt-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-ink-faint uppercase tracking-wider">
                          Заполненность профиля
                        </span>
                        <span className="font-serif text-brand tabular">{completeness}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-canvas border border-line overflow-hidden">
                        <div className="h-full bg-brand transition-all duration-500" style={{ width: `${completeness}%` }} />
                      </div>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
                        {completenessChecks.map(({ label, done }) => (
                          <li key={label} className={`flex items-center gap-1.5 text-xs ${done ? "text-green-700" : "text-ink-faint"}`}>
                            <Check className={`w-3.5 h-3.5 ${done ? "" : "opacity-30"}`} />
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ── CTA band (M2 bottom) ── */}
                <div className="bg-hero border border-line rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full bg-surface border border-line flex items-center justify-center shrink-0">
                      <Store className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-ink">Развивайте свой бизнес на SiGup</h3>
                      <p className="text-sm text-ink-soft mt-1 leading-relaxed max-w-md">
                        Добавляйте новые проекты, привлекайте клиентов и делитесь своими товарами и услугами.
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate(paths.create)} className="shrink-0">
                    <Plus className="w-4 h-4" /> Создать новую карточку
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      <Modal
        open={!!deleting}
        onClose={() => (deleteBusy ? undefined : setDeleting(null))}
        size="sm"
        title="Удалить карточку?"
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
          Карточка «{deleting?.name}» будет удалена навсегда вместе с фотографиями и товарами. Это действие нельзя
          отменить.
        </p>
      </Modal>
    </div>
  );
}

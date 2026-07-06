import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Plus, Edit3, Eye, Trash2, Bell, CheckCircle2,
  LayoutGrid, LogOut, Inbox, Home, Settings, Store, Loader2,
  RotateCcw, Check, Heart, MousePointerClick, Camera, Link2,
  ExternalLink, Package,
} from "lucide-react";
import { api, ApiCard, ApiError, CardStatus } from "../lib/api";
import { STATUS_EN_RU } from "../lib/mappers";
import { mediaUrl } from "../lib/media";
import { useAuth } from "../lib/auth";
import { paths } from "../lib/paths";
import { Button, Input, Badge, Modal, Skeleton, Chip, Avatar } from "./ui";

const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

const statusTone = (status: CardStatus): "success" | "warning" | "danger" | "neutral" => {
  if (status === "published") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "needs_revision") return "danger";
  return "neutral";
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

type Section = "overview" | "cards" | "settings";
type StatusFilter = "all" | "draft" | "pending" | "published" | "rejected" | "needs_revision";

// «all» reads as «Мои страницы»: a Card is one business page (with products inside).
const FILTER_TITLES: Record<StatusFilter, string> = {
  all: "Мои страницы",
  draft: "Черновики",
  pending: "На проверке",
  published: "Опубликованные",
  rejected: "Отклонённые",
  needs_revision: "Требуют доработки",
};

const matchesFilter = (c: ApiCard, f: StatusFilter) => {
  if (f === "all") return true;
  return c.status === f;
};

const pageWord = (n: number) => (n === 1 ? "страницу" : n < 5 ? "страницы" : "страниц");

// ─── Page preview: a Card rendered as «моя страница» (hero on the overview) ───
function PagePreview({
  card,
  variant,
  onDelete,
}: {
  card: ApiCard;
  variant: "hero" | "grid";
  onDelete: (card: ApiCard) => void;
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const cover = card.photos[0] ? mediaUrl(card.photos[0].url) : null;
  const loc = [card.city, card.country].filter(Boolean).join(", ");
  const published = card.status === "published";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${paths.project(card.slug)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const metrics = (
    <div className="flex items-center gap-4 text-ink-soft tabular">
      <span className="inline-flex items-center gap-1.5" title="Просмотры">
        <Eye className="w-4 h-4 text-ink-faint" /> {card.views_count}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Лайки">
        <Heart className={`w-4 h-4 ${card.likes_count > 0 ? "text-red-500" : "text-ink-faint"}`} /> {card.likes_count}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Клики по контактам">
        <MousePointerClick className="w-4 h-4 text-ink-faint" /> {card.clicks_count}
      </span>
      {card.products.length > 0 && (
        <span className="inline-flex items-center gap-1.5" title="Товары на странице">
          <Package className="w-4 h-4 text-ink-faint" /> {card.products.length}
        </span>
      )}
    </div>
  );

  // ─── Compact card for the «Ваши страницы» grid (2+ pages) ───
  if (variant === "grid") {
    return (
      <div className="bg-surface border border-line rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="relative aspect-video bg-canvas img-outline">
          {cover ? (
            <img src={cover} alt="" onError={hideBroken} className="w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-line-strong">
              <Store className="w-7 h-7" />
            </span>
          )}
          <span className="absolute top-2 left-2">
            <Badge tone={statusTone(card.status)}>{STATUS_EN_RU[card.status]}</Badge>
          </span>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-ink line-clamp-1">{card.name}</h3>
          <p className="text-xs text-ink-faint mt-0.5 line-clamp-1">
            {[card.category_name, loc].filter(Boolean).join(" · ") || "—"}
          </p>
          <div className="mt-3 text-xs">{metrics}</div>
          <div className="flex items-center gap-1.5 mt-auto pt-4">
            <button
              onClick={() => navigate(`/cabinet/edit/${card.id}`)}
              title="Редактировать"
              className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-brand hover:border-line-strong transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            {published && (
              <button
                onClick={() => navigate(paths.project(card.slug))}
                title="Открыть на сайте"
                className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-brand hover:border-line-strong transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(card)}
              title="Удалить"
              className="ml-auto w-8 h-8 rounded-sm border border-line flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Hero for the single-page case ───
  return (
    <div className="bg-surface border border-line rounded-lg shadow-card overflow-hidden flex flex-col sm:flex-row">
      <div className="relative sm:w-64 lg:w-72 shrink-0 aspect-video sm:aspect-auto bg-canvas img-outline">
        {cover ? (
          <img src={cover} alt="" onError={hideBroken} className="w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-line-strong">
            <Store className="w-9 h-9" />
          </span>
        )}
        <span className="absolute top-3 left-3">
          <Badge tone={statusTone(card.status)}>{STATUS_EN_RU[card.status]}</Badge>
        </span>
      </div>

      <div className="flex-1 min-w-0 p-6 sm:p-7 flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-dark">Моя страница</span>
        <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-tight mt-1">{card.name}</h2>
        <p className="text-sm text-ink-soft mt-1.5 flex items-center gap-1.5 flex-wrap">
          <span>{card.category_name ?? "—"}</span>
          {loc && (
            <>
              <span className="text-ink-faint">·</span>
              <MapPin className="w-3.5 h-3.5 text-gold" />
              {loc}
            </>
          )}
        </p>
        {card.short_description && (
          <p className="text-sm text-ink-soft mt-3 leading-relaxed line-clamp-2 max-w-xl">{card.short_description}</p>
        )}

        <div className="mt-4 text-sm">{metrics}</div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-line">
          <Button onClick={() => navigate(`/cabinet/edit/${card.id}`)}>
            <Edit3 className="w-4 h-4" /> Редактировать
          </Button>
          {published && (
            <Button variant="secondary" onClick={() => navigate(paths.project(card.slug))}>
              <ExternalLink className="w-4 h-4" /> Открыть на сайте
            </Button>
          )}
          {published && (
            <Button variant="secondary" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4 text-green-700" /> : <Link2 className="w-4 h-4" />}
              {copied ? "Скопировано" : "Ссылка"}
            </Button>
          )}
          <button
            onClick={() => onDelete(card)}
            title="Удалить"
            className="ml-auto w-9 h-9 rounded-sm border border-line flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

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
            <th className="pb-3 pr-4 font-semibold hidden xl:table-cell">Активность</th>
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
              <td className="py-4 pr-4 hidden xl:table-cell">
                <div className="flex items-center gap-3 text-ink-faint tabular">
                  <span className="inline-flex items-center gap-1" title="Просмотры">
                    <Eye className="w-3.5 h-3.5" />
                    {c.views_count}
                  </span>
                  <span className="inline-flex items-center gap-1" title="Лайки">
                    <Heart className={`w-3.5 h-3.5 ${c.likes_count > 0 ? "text-red-500" : ""}`} />
                    {c.likes_count}
                  </span>
                </div>
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

  // ─── Avatar: upload a file OR set by URL ───
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Выберите файл изображения.");
      return;
    }
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await api.cabinet.uploadAvatar(file);
      await refresh(); // updates the sidebar/topbar avatar everywhere
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : "Не удалось загрузить фото");
    } finally {
      setAvatarBusy(false);
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const saveAvatarUrl = async () => {
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await api.cabinet.updateProfile({ avatar_url: avatarUrl.trim() || null });
      await refresh();
      setUrlMode(false);
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : "Не удалось сохранить ссылку");
    } finally {
      setAvatarBusy(false);
    }
  };

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
    <form onSubmit={submit} className="flex flex-col gap-5">
      {/* Avatar */}
      <div className="flex items-start gap-4 pb-5 border-b border-line">
        <Avatar name={user?.name} src={user?.avatar_url} className="w-16 h-16 bg-brand text-brand-fg font-serif text-2xl" />
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-ink">Фотография профиля</span>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={avatarBusy}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm border border-line bg-surface text-sm font-medium text-ink-soft hover:text-ink hover:border-line-strong transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.96]"
            >
              {avatarBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              Загрузить фото
            </button>
            <button
              type="button"
              onClick={() => {
                setAvatarUrl(user?.avatar_url ?? "");
                setUrlMode((v) => !v);
                setAvatarError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" /> указать ссылкой
            </button>
          </div>
          {urlMode && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 mt-3">
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…/photo.jpg"
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={saveAvatarUrl} disabled={avatarBusy} className="shrink-0">
                {avatarBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Сохранить
              </Button>
            </div>
          )}
          {avatarError && <p className="text-xs text-red-600 mt-2">{avatarError}</p>}
          <input ref={avatarFileRef} type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} className="hidden" />
        </div>
      </div>

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
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Не удалось загрузить страницы"));
  };
  useEffect(load, []);

  const all = cards ?? [];
  const counts = useMemo(
    () => ({
      all: all.length,
      draft: all.filter((c) => c.status === "draft").length,
      pending: all.filter((c) => c.status === "pending").length,
      published: all.filter((c) => c.status === "published").length,
      rejected: all.filter((c) => c.status === "rejected").length,
      needsRevision: all.filter((c) => c.status === "needs_revision").length,
    }),
    [all]
  );

  // Platform engagement across all of this entrepreneur's pages.
  const engagement = useMemo(
    () =>
      all.reduce(
        (acc, c) => ({
          views: acc.views + (c.views_count ?? 0),
          clicks: acc.clicks + (c.clicks_count ?? 0),
          likes: acc.likes + (c.likes_count ?? 0),
        }),
        { views: 0, clicks: 0, likes: 0 }
      ),
    [all]
  );

  const notifications = useMemo(
    () => all.filter((c) => c.status === "rejected" || c.status === "needs_revision"),
    [all]
  );

  const filtered = useMemo(() => all.filter((c) => matchesFilter(c, statusFilter)), [all, statusFilter]);
  const ROWS_CAP = 5;
  const rows = showAllRows ? filtered : filtered.slice(0, ROWS_CAP);
  const hiddenRows = filtered.length - rows.length;

  // Profile completeness: name / phone / city / country / has ≥1 page, 20% each.
  const completenessChecks: { label: string; done: boolean }[] = [
    { label: "ФИО", done: !!user?.name },
    { label: "Телефон", done: !!user?.phone },
    { label: "Город", done: !!user?.city },
    { label: "Страна", done: !!user?.country },
    { label: "Есть страница", done: all.length > 0 },
  ];
  const completeness = Math.round((completenessChecks.filter((c) => c.done).length / completenessChecks.length) * 100);

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
      setLoadError(e instanceof Error ? e.message : "Не удалось удалить страницу");
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  // ─── Sidebar nav: navigation only — status filtering lives in-page ───
  const navMain = [
    { key: "overview" as const, label: "Обзор", Icon: Home, active: section === "overview", onClick: goOverview },
    { key: "cards" as const, label: "Мои страницы", Icon: LayoutGrid, count: counts.all, active: section === "cards", onClick: () => selectFilter("all") },
    { key: "create" as const, label: "Новая страница", Icon: Plus, active: false, onClick: () => navigate(paths.create) },
  ];

  // ─── In-page status tabs above «Мои страницы» ───
  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Все", count: counts.all },
    { key: "draft", label: "Черновики", count: counts.draft },
    { key: "pending", label: "На проверке", count: counts.pending },
    { key: "published", label: "Опубликованные", count: counts.published },
    { key: "rejected", label: "Отклонённые", count: counts.rejected },
    { key: "needs_revision", label: "Требуют доработки", count: counts.needsRevision },
  ];

  const engagementStats: { label: string; value: number; Icon: typeof Eye }[] = [
    { label: "Просмотры", value: engagement.views, Icon: Eye },
    { label: "Клики по контактам", value: engagement.clicks, Icon: MousePointerClick },
    { label: "Лайки", value: engagement.likes, Icon: Heart },
  ];

  const cardsPanel = (
    <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">{FILTER_TITLES[statusFilter]}</h2>
          <p className="text-sm text-ink-soft mt-0.5">Изменения появляются в каталоге после модерации.</p>
        </div>
        <Button id="cabinet-create-card-btn" onClick={() => navigate(paths.create)} className="shrink-0">
          <Plus className="w-4 h-4" /> Новая страница
        </Button>
      </div>

      {/* Status filter tabs (relocated from the sidebar) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map((t) => (
          <Chip key={t.key} active={statusFilter === t.key} onClick={() => setStatusFilter(t.key)}>
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-1.5 tabular text-xs ${statusFilter === t.key ? "text-brand-fg/70" : "text-ink-faint"}`}
              >
                {t.count}
              </span>
            )}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-md border border-dashed border-line bg-canvas">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
          <p className="text-sm text-ink-soft">
            {statusFilter === "all" ? "У вас пока нет страницы — создайте первую." : "В этом статусе пока нет страниц."}
          </p>
          {statusFilter === "all" && (
            <Button size="sm" className="mt-4" onClick={() => navigate(paths.create)}>
              <Plus className="w-4 h-4" /> Создать страницу
            </Button>
          )}
        </div>
      ) : (
        <>
          <CardsTable cards={rows} onDelete={setDeleting} />
          {hiddenRows > 0 && (
            <div className="flex justify-center mt-5">
              <Button variant="secondary" size="sm" onClick={() => setShowAllRows(true)}>
                Показать ещё {hiddenRows} {pageWord(hiddenRows)}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ─── Overview: page(s) as the hero, not a list of cards to grow ───
  const overview = (
    <>
      {all.length === 0 ? (
        <div className="bg-hero border border-line rounded-lg p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-surface border border-line flex items-center justify-center mb-4">
            <Store className="w-7 h-7 text-brand" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink">Создайте свою страницу на SiGup</h2>
          <p className="text-ink-soft mt-2 max-w-md leading-relaxed">
            Одна страница — это ваше предприятие: фото, описание, товары и контакты. После проверки она появится
            в каталоге, и её увидят люди.
          </p>
          <Button className="mt-5" onClick={() => navigate(paths.create)}>
            <Plus className="w-4 h-4" /> Создать страницу
          </Button>
        </div>
      ) : all.length === 1 ? (
        <PagePreview card={all[0]} variant="hero" onDelete={setDeleting} />
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-serif text-2xl text-ink">Ваши страницы</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate(paths.create)} className="shrink-0">
              <Plus className="w-4 h-4" /> Новая страница
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {all.map((c) => (
              <PagePreview key={c.id} card={c} variant="grid" onDelete={setDeleting} />
            ))}
          </div>
        </div>
      )}

      {/* Aggregate engagement — only meaningful when there is more than one page */}
      {all.length >= 2 && (
        <div>
          <h2 className="font-serif text-lg text-ink mb-3">Вовлечённость по всем страницам</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {engagementStats.map(({ label, value, Icon }) => (
              <div key={label} className="bg-surface border border-line rounded-md shadow-sm p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-sm bg-brand-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <div className="font-sans text-3xl font-semibold tabular text-ink leading-none">
                    {value.toLocaleString("ru-RU")}
                  </div>
                  <p className="text-xs text-ink-faint uppercase tracking-wider mt-1.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications + account summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-line rounded-lg shadow-card p-6">
          <div className="flex items-center gap-2.5 border-b border-line pb-3.5 mb-4">
            <Bell className="w-4 h-4 text-gold" />
            <h3 className="font-serif text-lg text-ink">Уведомления модерации</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8 text-ink-faint">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm text-ink-soft">Нет страниц, требующих внимания.</p>
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
                      Страница «{c.name}» {c.status === "rejected" ? "отклонена" : "требует доработки"}
                    </h4>
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                      {c.admin_comment || "Внесите изменения и отправьте страницу на повторную проверку."}
                    </p>
                    <p className="text-xs text-ink-faint mt-1.5 tabular">{fmtDate(c.updated_at)}</p>
                    <div className="mt-3">
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/cabinet/edit/${c.id}`)}>
                        Перейти к странице
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
              <span className="font-sans font-semibold text-brand tabular">{completeness}%</span>
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

      {/* Grow CTA — about improving/sharing your page, secondary create */}
      <div className="bg-hero border border-line rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-full bg-surface border border-line flex items-center justify-center shrink-0">
            <Store className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h3 className="font-serif text-xl text-ink">Развивайте своё дело на SiGup</h3>
            <p className="text-sm text-ink-soft mt-1 leading-relaxed max-w-md">
              Обновляйте страницу, добавляйте товары и делитесь ссылкой — так вас найдёт больше людей.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate(paths.create)} className="shrink-0">
          <Plus className="w-4 h-4" /> Ещё одна страница
        </Button>
      </div>
    </>
  );

  return (
    <div className="bg-canvas py-8 sm:py-12 min-h-screen">
      <title>Личный кабинет — SiGup</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
          {/* ── LEFT: profile + nav ── */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-line rounded-lg shadow-card p-6 lg:sticky lg:top-24">
              <div className="flex flex-col items-center text-center pb-6 border-b border-line">
                <Avatar name={user?.name} src={user?.avatar_url} className="w-20 h-20 bg-brand text-brand-fg font-serif text-4xl mb-3.5" />
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
          <div className="lg:col-span-9 flex flex-col gap-6 lg:gap-8">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Личный кабинет</h1>
              <p className="text-lg font-medium text-ink mt-2">Здравствуйте, {user?.name}</p>
              <p className="text-ink-soft mt-1 max-w-xl leading-relaxed">
                Здесь ваша страница на SiGup: управляйте ей, добавляйте товары и следите за откликом.
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
                <div className="bg-surface border border-line rounded-lg p-6 flex flex-col sm:flex-row gap-6">
                  <Skeleton className="w-full sm:w-64 h-40 rounded-md" />
                  <div className="flex-1 flex flex-col gap-3">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-10 w-52 mt-auto" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
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
              overview
            )}
          </div>
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      <Modal
        open={!!deleting}
        onClose={() => (deleteBusy ? undefined : setDeleting(null))}
        size="sm"
        title="Удалить страницу?"
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
          Страница «{deleting?.name}» будет удалена навсегда вместе с фотографиями и товарами. Это действие нельзя
          отменить.
        </p>
      </Modal>
    </div>
  );
}

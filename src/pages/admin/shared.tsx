/**
 * Общие кирпичики админ-страниц (U10): заголовки, статусные бейджи,
 * таблица очереди модерации, модал комментария, инлайн-ноты.
 */
import React, { useEffect, useState } from "react";
import { CheckCircle2, Inbox, Loader2, RotateCcw, X } from "lucide-react";
import { ApiCard, ApiError, CardStatus, EventStatus } from "../../lib/api";
import { STATUS_EN_RU } from "../../lib/mappers";
import { mediaUrl } from "../../lib/media";
import { Badge, Button, Modal, Skeleton, Textarea } from "../../components/ui";

export const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) =>
  (e.currentTarget.style.opacity = "0");

// ─── Даты ───

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  );
};

/** Относительная дата для ленты активности: «5 мин назад», «вчера», «25 июня». */
export function relDate(iso: string): string {
  const d = new Date(iso);
  const min = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const days = Math.floor(h / 24);
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

// ─── Статусы ───

type Tone = "neutral" | "brand" | "gold" | "success" | "warning" | "danger";

export const cardStatusTone = (status: CardStatus): Tone => {
  if (status === "published") return "success";
  if (status === "pending") return "warning";
  if (status === "needs_revision") return "gold";
  if (status === "rejected") return "danger";
  return "neutral";
};

export function CardStatusBadge({ status }: { status: CardStatus }) {
  return <Badge tone={cardStatusTone(status)}>{STATUS_EN_RU[status]}</Badge>;
}

export const EVENT_STATUS_RU: Record<EventStatus, string> = {
  draft: "Черновик",
  published: "Опубликовано",
  hidden: "Скрыто",
  finished: "Завершено",
};

export const eventStatusTone = (status: EventStatus): Tone => {
  if (status === "published") return "success";
  if (status === "finished") return "gold";
  return "neutral";
};

export const EVENT_TYPE_RU: Record<string, string> = {
  event: "Мероприятие",
  promo: "Акция",
  announcement: "Объявление",
  other: "Другое",
};

// ─── Каркас страницы ───

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-soft mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-surface border border-line rounded-lg shadow-card p-10 text-center">
      <p className="text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          <RotateCcw className="w-4 h-4" /> Повторить
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-12 rounded-md border border-dashed border-line bg-canvas">
      <Inbox className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
      <p className="text-sm text-ink-soft">{text}</p>
      {children}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/** Зелёная инлайн-нота об успешном действии (закрывается крестиком). */
export function SuccessNote({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-sm px-3.5 py-2.5 text-sm">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span className="flex-1">{text}</span>
      <button onClick={onClose} aria-label="Скрыть" className="p-1 -mr-1 rounded-sm hover:bg-green-100 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/** Красная инлайн-нота об ошибке действия. */
export function ErrorNote({ text, onClose }: { text: string; onClose?: () => void }) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-sm px-3.5 py-2.5 text-sm">
      <X className="w-4 h-4 shrink-0" />
      <span className="flex-1">{text}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Скрыть" className="p-1 -mr-1 rounded-sm hover:bg-red-100 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Мелкие элементы таблиц ───

export function Thumb({ src, className = "w-10 h-10" }: { src?: string | null; className?: string }) {
  return (
    <div className={`${className} rounded-sm bg-canvas overflow-hidden shrink-0 img-outline`}>
      {src && <img src={mediaUrl(src)} alt="" onError={hideBroken} className="w-full h-full object-cover" />}
    </div>
  );
}

const iconBtnTones = {
  brand: "bg-brand text-brand-fg border-brand hover:bg-brand-hover",
  gold: "bg-surface text-gold-dark border-line hover:border-gold hover:bg-gold/12",
  danger: "bg-surface text-red-500 border-line hover:border-red-200 hover:bg-red-50",
  neutral: "bg-surface text-ink-soft border-line hover:text-brand hover:border-line-strong",
} as const;

export function IconBtn({
  title,
  tone = "neutral",
  busy,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  tone?: keyof typeof iconBtnTones;
  busy?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      className={`w-8 h-8 rounded-sm border flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${iconBtnTones[tone]} ${className}`}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : children}
    </button>
  );
}

// ─── Таблица очереди модерации (дашборд + раздел «На модерации») ───

export function ModerationTable({
  cards,
  actions,
}: {
  cards: ApiCard[];
  actions: (card: ApiCard) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
            <th className="pb-3 pr-4 font-semibold">Карточка</th>
            <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Категория</th>
            <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Автор</th>
            <th className="pb-3 pr-4 font-semibold hidden lg:table-cell">Дата добавления</th>
            <th className="pb-3 pr-4 font-semibold">Статус</th>
            <th className="pb-3 text-right font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-3">
                  <Thumb src={c.photos[0]?.thumb_url ?? c.photos[0]?.url} />
                  <span className="font-medium text-ink truncate max-w-[180px] block">{c.name}</span>
                </div>
              </td>
              <td className="py-3.5 pr-4 text-ink-soft hidden sm:table-cell">{c.category_name ?? "—"}</td>
              <td className="py-3.5 pr-4 text-ink-soft hidden md:table-cell truncate max-w-[160px]">{c.owner_name ?? "—"}</td>
              <td className="py-3.5 pr-4 text-ink-faint tabular hidden lg:table-cell whitespace-nowrap">{fmtDateTime(c.created_at)}</td>
              <td className="py-3.5 pr-4">
                <CardStatusBadge status={c.status} />
              </td>
              <td className="py-3.5">
                <div className="flex items-center justify-end gap-1.5">{actions(c)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Модал с обязательным комментарием (reject / needs-revision) ───

export function CommentModal({
  open,
  title,
  description,
  submitLabel,
  submitVariant = "danger",
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  submitLabel: string;
  submitVariant?: "danger" | "primary" | "gold";
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setComment("");
      setBusy(false);
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      setError("Комментарий обязателен — предприниматель должен понимать причину.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось выполнить действие");
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => (busy ? undefined : onClose())}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button variant={submitVariant} onClick={submit} disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5">
        <p className="text-sm text-ink-soft leading-relaxed">{description}</p>
        <Textarea
          label="Комментарий для предпринимателя"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Например: добавьте фотографии и уточните описание…"
          error={error ?? undefined}
          autoFocus
        />
      </div>
    </Modal>
  );
}

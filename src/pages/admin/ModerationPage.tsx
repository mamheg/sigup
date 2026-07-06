/**
 * Полная очередь модерации: вкладки по статусам, действия
 * approve / needs-revision / reject с обязательным комментарием.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, PenLine, X } from "lucide-react";
import { api, ApiCard, ApiError, CardStatus } from "../../lib/api";
import { Card, Chip } from "../../components/ui";
import {
  CommentModal, EmptyState, ErrorNote, ErrorState, ModerationTable,
  PageHeader, SuccessNote, TableSkeleton, IconBtn,
} from "./shared";

type Tab = "pending" | "needs_revision" | "rejected";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "На проверке" },
  { key: "needs_revision", label: "Требуют доработки" },
  { key: "rejected", label: "Отклонённые" },
];

const EMPTY_TEXTS: Record<Tab, string> = {
  pending: "Очередь пуста — все карточки проверены.",
  needs_revision: "Нет карточек, отправленных на доработку.",
  rejected: "Отклонённых карточек нет.",
};

export default function ModerationPage() {
  const [cards, setCards] = useState<ApiCard[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [note, setNote] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ card: ApiCard; action: "reject" | "needs_revision" } | null>(null);

  const fetchCards = useCallback(() => api.admin.cards("all").then(setCards), []);

  const load = useCallback(() => {
    setLoadError(null);
    setCards(null);
    fetchCards().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Не удалось загрузить очередь модерации")
    );
  }, [fetchCards]);

  useEffect(load, [load]);

  const counts = useMemo(() => {
    const all = cards ?? [];
    const by = (s: CardStatus) => all.filter((c) => c.status === s).length;
    return { pending: by("pending"), needs_revision: by("needs_revision"), rejected: by("rejected") };
  }, [cards]);

  const rows = useMemo(() => (cards ?? []).filter((c) => c.status === tab), [cards, tab]);

  const runAction = async (card: ApiCard, fn: () => Promise<unknown>, doneText: string) => {
    setBusyId(card.id);
    setActionError(null);
    setNote(null);
    try {
      await fn();
      await fetchCards();
      setNote(doneText);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Не удалось выполнить действие");
    } finally {
      setBusyId(null);
    }
  };

  const approve = (card: ApiCard) =>
    runAction(card, () => api.admin.approve(card.id), `Карточка «${card.name}» опубликована.`);

  const submitModal = async (comment: string) => {
    if (!modal) return;
    const { card, action } = modal;
    if (action === "reject") await api.admin.reject(card.id, comment);
    else await api.admin.needsRevision(card.id, comment);
    setModal(null);
    await fetchCards();
    setNote(
      action === "reject"
        ? `Карточка «${card.name}» отклонена.`
        : `Карточка «${card.name}» отправлена на доработку.`
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <title>Модерация — админ-панель SiGup</title>
      <PageHeader
        title="На модерации"
        subtitle="Очередь карточек: публикация, отклонение и возврат на доработку"
      />

      {note && <SuccessNote text={note} onClose={() => setNote(null)} />}
      {actionError && <ErrorNote text={actionError} onClose={() => setActionError(null)} />}

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <Chip key={key} active={tab === key} onClick={() => setTab(key)}>
            {label}
            {cards !== null && (
              <span className={`ml-1.5 tabular text-xs ${tab === key ? "text-brand-fg/80" : "text-ink-faint"}`}>
                {counts[key]}
              </span>
            )}
          </Chip>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : cards === null ? (
          <TableSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState text={EMPTY_TEXTS[tab]} />
        ) : (
          <ModerationTable
            cards={rows}
            actions={(c) => (
              <>
                <IconBtn title="Опубликовать" tone="brand" busy={busyId === c.id} onClick={() => approve(c)}>
                  <Check className="w-4 h-4" />
                </IconBtn>
                {c.status === "pending" && (
                  <>
                    <IconBtn
                      title="На доработку"
                      tone="gold"
                      disabled={busyId === c.id}
                      onClick={() => setModal({ card: c, action: "needs_revision" })}
                    >
                      <PenLine className="w-3.5 h-3.5" />
                    </IconBtn>
                    <IconBtn
                      title="Отклонить"
                      tone="danger"
                      disabled={busyId === c.id}
                      onClick={() => setModal({ card: c, action: "reject" })}
                    >
                      <X className="w-4 h-4" />
                    </IconBtn>
                  </>
                )}
              </>
            )}
          />
        )}
      </Card>

      <CommentModal
        open={!!modal}
        title={modal?.action === "reject" ? "Отклонить карточку" : "Отправить на доработку"}
        description={
          modal?.action === "reject" ? (
            <>Карточка «{modal?.card.name}» будет отклонена. Комментарий увидит предприниматель в личном кабинете.</>
          ) : (
            <>
              Карточка «{modal?.card.name}» вернётся предпринимателю на доработку. Опишите, что нужно исправить.
            </>
          )
        }
        submitLabel={modal?.action === "reject" ? "Отклонить" : "На доработку"}
        submitVariant={modal?.action === "reject" ? "danger" : "gold"}
        onClose={() => setModal(null)}
        onSubmit={submitModal}
      />
    </div>
  );
}

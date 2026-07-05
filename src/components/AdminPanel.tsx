import { useMemo, useState } from "react";
import { Project, ProjectStatus, EventItem } from "../types";
import {
  Check, X, Users, FolderCheck, TrendingUp, CheckCircle, MapPin, Eye,
} from "lucide-react";
import { Button, Card, Badge, Modal, Textarea } from "./ui";

interface AdminPanelProps {
  projects: Project[];
  events: EventItem[];
  onApproveProject: (id: string) => void;
  onRejectProject: (id: string, comment: string) => void;
  onSelectProject: (id: string) => void;
}

// Broken images collapse silently rather than showing a torn icon.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

type Tab = "dashboard" | "moderation" | "users";

export default function AdminPanel({
  projects,
  events,
  onApproveProject,
  onRejectProject,
  onSelectProject,
}: AdminPanelProps) {
  const [commentingProjectId, setCommentingProjectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const pendingProjects = useMemo(
    () => projects.filter((p) => p.status === ProjectStatus.Pending),
    [projects]
  );

  // Moderation queue = anything awaiting a decision (new + returned for revision).
  const moderationQueue = useMemo(
    () =>
      projects.filter(
        (p) => p.status === ProjectStatus.Pending || p.status === ProjectStatus.NeedsRevision
      ),
    [projects]
  );

  const publishedCount = useMemo(
    () => projects.filter((p) => p.status === ProjectStatus.Published).length,
    [projects]
  );

  const entrepreneursCount = useMemo(
    () => new Set(projects.map((p) => p.authorId)).size,
    [projects]
  );

  // Real, computed registry of entrepreneurs derived from their projects.
  const entrepreneurs = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; cities: Set<string> }>();
    for (const p of projects) {
      const entry = map.get(p.authorId) ?? { id: p.authorId, name: p.authorName, count: 0, cities: new Set<string>() };
      entry.count += 1;
      if (p.city) entry.cities.add(p.city);
      map.set(p.authorId, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [projects]);

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentingProjectId && rejectComment.trim()) {
      onRejectProject(commentingProjectId, rejectComment.trim());
      setCommentingProjectId(null);
      setRejectComment("");
    }
  };

  const closeReject = () => {
    setCommentingProjectId(null);
    setRejectComment("");
  };

  const stats = [
    { label: "Новые заявки", value: pendingProjects.length, hint: "ожидают проверки" },
    { label: "Опубликовано", value: publishedCount, hint: "витрин в каталоге" },
    { label: "Участники", value: entrepreneursCount, hint: "предпринимателей" },
    { label: "Афиша событий", value: events.length, hint: "мероприятий" },
  ];

  const heading =
    activeTab === "dashboard"
      ? "Сводная аналитика"
      : activeTab === "moderation"
      ? `Проверка заявок (${moderationQueue.length})`
      : "Реестр предпринимателей";

  const tabs: { key: Tab; label: string; Icon: typeof TrendingUp; badge?: number }[] = [
    { key: "dashboard", label: "Общий дашборд", Icon: TrendingUp },
    { key: "moderation", label: "На модерации", Icon: FolderCheck, badge: moderationQueue.length },
    { key: "users", label: "База предпринимателей", Icon: Users },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink pb-16">
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand text-brand-fg font-serif font-semibold flex items-center justify-center text-sm select-none">
              АД
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Контроль витрин</p>
              <p className="text-sm font-serif text-brand">Администратор SiGup</p>
            </div>
          </div>
          <span className="hidden sm:inline text-xs text-ink-faint select-none">admin@sigup.ru</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="p-3 lg:sticky lg:top-24 rounded-lg" as="section">
              <nav className="flex flex-col gap-1">
                {tabs.map(({ key, label, Icon, badge }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-4 py-3 rounded-sm flex items-center justify-between gap-3 text-sm font-medium transition-colors cursor-pointer ${
                        active ? "bg-brand text-brand-fg" : "text-ink-soft hover:bg-brand-muted hover:text-ink"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-brand-fg" : "text-gold"}`} />
                        {label}
                      </span>
                      {badge != null && badge > 0 && (
                        <span
                          className={`tabular text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            active ? "bg-brand-fg/20 text-brand-fg" : "bg-gold text-white"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <header>
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">Административный терминал</p>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-1 tracking-tight">{heading}</h1>
              <p className="text-ink-soft text-sm mt-1 max-w-2xl leading-relaxed">
                Верификация локальных брендов черкесского сообщества: соответствие каталогу, география и качество карточек.
              </p>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((s) => (
                <Card key={s.label} className="p-4 sm:p-5 flex flex-col gap-2">
                  <span className="text-[11px] text-ink-faint uppercase tracking-widest font-semibold">{s.label}</span>
                  <span className="font-serif text-3xl text-brand tabular leading-none">{s.value}</span>
                  <span className="text-[11px] text-ink-faint">{s.hint}</span>
                </Card>
              ))}
            </div>

            {/* Moderation queue */}
            {(activeTab === "dashboard" || activeTab === "moderation") && (
              <Card className="p-5 sm:p-7 rounded-lg" as="section">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-4 mb-5">
                  <div>
                    <h2 className="font-serif text-xl text-ink">Очередь верификации</h2>
                    <p className="text-sm text-ink-soft mt-0.5">
                      Заявки предпринимателей. Одобрение публикует карточку в каталоге.
                    </p>
                  </div>
                  {moderationQueue.length > 0 && (
                    <Badge tone="warning" className="shrink-0">
                      Ждут решения: <span className="tabular">{moderationQueue.length}</span>
                    </Badge>
                  )}
                </div>

                {moderationQueue.length === 0 ? (
                  <div className="text-center py-14 rounded-md border border-dashed border-line bg-canvas">
                    <CheckCircle className="w-10 h-10 text-brand mx-auto mb-3" />
                    <h3 className="font-serif text-lg text-ink">Очередь проверок пуста</h3>
                    <p className="text-sm text-ink-faint mt-1 max-w-xs mx-auto">
                      Все заявки рассмотрены и размещены на витрине.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {moderationQueue.map((p) => (
                      <li
                        key={p.id}
                        id={`admin-queue-row-${p.id}`}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 rounded-md border border-line bg-surface hover:border-line-strong transition-colors"
                      >
                        <div className="w-14 h-14 rounded-sm bg-canvas overflow-hidden shrink-0 img-outline">
                          {p.photos?.[0] && (
                            <img src={p.photos[0]} alt="" onError={hideBroken} className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => onSelectProject(p.id)}
                            className="font-serif text-lg text-ink hover:text-brand transition-colors block truncate max-w-full text-left"
                          >
                            {p.name}
                          </button>
                          <div className="flex items-center gap-2 text-sm text-ink-soft mt-0.5">
                            <span className="truncate">{p.category}</span>
                            {p.city && (
                              <>
                                <span className="text-ink-faint">·</span>
                                <span className="inline-flex items-center gap-1 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                  {p.city}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <Badge tone={p.status === ProjectStatus.NeedsRevision ? "danger" : "warning"} className="shrink-0 self-start sm:self-center">
                          {p.status}
                        </Badge>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            id={`admin-approve-btn-${p.id}`}
                            onClick={() => onApproveProject(p.id)}
                            title="Одобрить"
                          >
                            <Check className="w-4 h-4" /> Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            id={`admin-view-btn-${p.id}`}
                            onClick={() => onSelectProject(p.id)}
                            title="Посмотреть"
                            aria-label="Посмотреть карточку"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            id={`admin-reject-btn-${p.id}`}
                            onClick={() => setCommentingProjectId(p.id)}
                            title="Отклонить с замечаниями"
                            aria-label="Отклонить"
                            className="text-red-600 hover:bg-red-50 hover:border-red-200"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {/* Entrepreneurs registry */}
            {activeTab === "users" && (
              <Card className="p-5 sm:p-7 rounded-lg" as="section">
                <div className="border-b border-line pb-4 mb-5">
                  <h2 className="font-serif text-xl text-ink">Зарегистрированные предприниматели</h2>
                  <p className="text-sm text-ink-soft mt-0.5">
                    Список сформирован по авторам карточек на платформе.
                  </p>
                </div>

                {entrepreneurs.length === 0 ? (
                  <div className="text-center py-14 rounded-md border border-dashed border-line bg-canvas">
                    <Users className="w-10 h-10 text-brand mx-auto mb-3" />
                    <p className="text-sm text-ink-faint">Пока нет ни одного предпринимателя.</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {entrepreneurs.map((e) => (
                      <li
                        key={e.id}
                        className="p-4 rounded-md border border-line bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <h3 className="font-serif text-lg text-ink truncate">{e.name}</h3>
                          <p className="text-sm text-ink-soft truncate">
                            {e.cities.size > 0 ? Array.from(e.cities).join(", ") : "Город не указан"}
                          </p>
                        </div>
                        <Badge tone="brand" className="shrink-0 self-start sm:self-center">
                          <span className="tabular">{e.count}</span>
                          {e.count === 1 ? " карточка" : " карточек"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reject reason modal */}
      <Modal
        open={commentingProjectId !== null}
        onClose={closeReject}
        title="Указать причину доработки"
        size="sm"
      >
        <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Опишите владельцу дела, какие моменты необходимо поправить перед повторной подачей.
          </p>
          <Textarea
            rows={4}
            required
            autoFocus
            label="Комментарий для предпринимателя"
            placeholder="Например: уточните состав комплекта или загрузите более качественные фотографии…"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={closeReject}>
              Отмена
            </Button>
            <Button type="submit" variant="danger" disabled={!rejectComment.trim()}>
              Выставить замечание
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

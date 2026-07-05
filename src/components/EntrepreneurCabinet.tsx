import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Project, ProjectCategory, ProjectStatus } from "../types";
import { paths } from "../lib/paths";
import {
  MapPin, Plus, Edit3, Eye, Trash2, Bell, CheckCircle2, AlertTriangle,
  Folder, Clock, LogOut, Upload, X, Inbox,
} from "lucide-react";
import { Button, Input, Textarea, Select, Badge, Modal } from "./ui";

interface EntrepreneurCabinetProps {
  projects: Project[];
  onCreateCard: (newProject: Omit<Project, "id" | "authorId" | "authorName" | "updatedAt">) => void;
  onUpdateCard: (updatedProject: Project) => void;
  onDeleteCard: (id: string) => void;
  onSelectProject: (id: string) => void;
  onOpenAddCardModal: () => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

const statusTone = (status: ProjectStatus): "success" | "warning" | "danger" | "neutral" => {
  if (status === ProjectStatus.Published) return "success";
  if (status === ProjectStatus.Pending) return "warning";
  if (status === ProjectStatus.NeedsRevision || status === ProjectStatus.Rejected) return "danger";
  return "neutral";
};

const FORM_ID = "cabinet-card-form";
const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=400";

export default function EntrepreneurCabinet({
  projects,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onSelectProject,
  onOpenAddCardModal,
  isAddModalOpen,
  setIsAddModalOpen,
}: EntrepreneurCabinetProps) {
  const navigate = useNavigate();
  const [editingCard, setEditingCard] = useState<Project | null>(null);

  // Form Field States
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ProjectCategory>(ProjectCategory.Products);
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formFullDesc, setFormFullDesc] = useState("");
  const [formCountry, setFormCountry] = useState("Россия");
  const [formCity, setFormCity] = useState("Майкоп");
  const [formAddress, setFormAddress] = useState("");
  const [formInstagram, setFormInstagram] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formTelegram, setFormTelegram] = useState("");
  const [formDelivery, setFormDelivery] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([DEFAULT_PHOTO]);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");

  const askersProjects = projects.filter((p) => p.authorId === "asker-khakunov");

  // Real metrics derived from the user's projects.
  const totalCount = askersProjects.length;
  const publishedCount = askersProjects.filter((p) => p.status === ProjectStatus.Published).length;
  const pendingCount = askersProjects.filter((p) => p.status === ProjectStatus.Pending).length;
  const revisionCount = askersProjects.filter((p) => p.status === ProjectStatus.NeedsRevision).length;

  const completeness = totalCount ? Math.round((publishedCount / totalCount) * 100) : 0;

  // Moderation notifications derived from cards that need revision.
  const revisionProjects = askersProjects.filter((p) => p.status === ProjectStatus.NeedsRevision);

  const filteredAskersProjects = askersProjects.filter((p) => {
    if (statusFilter === "All") return true;
    return p.status === statusFilter;
  });

  const handleEditClick = (project: Project) => {
    setEditingCard(project);
    setFormName(project.name);
    setFormCategory(project.category);
    setFormShortDesc(project.shortDescription);
    setFormFullDesc(project.fullDescription);
    setFormCountry(project.country);
    setFormCity(project.city);
    setFormAddress(project.address || "");
    setFormInstagram(project.instagram || "");
    setFormPhone(project.phone || "");
    setFormWhatsapp(project.whatsapp || "");
    setFormTelegram(project.telegram || "");
    setFormDelivery(project.deliveryInfo || "");
    setFormPhotos(project.photos || []);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingCard(null);
    setFormName("");
    setFormCategory(ProjectCategory.Products);
    setFormShortDesc("");
    setFormFullDesc("");
    setFormCountry("Россия");
    setFormCity("Майкоп");
    setFormAddress("");
    setFormInstagram("");
    setFormPhone("");
    setFormWhatsapp("");
    setFormTelegram("");
    setFormDelivery("");
    setFormPhotos([DEFAULT_PHOTO]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formShortDesc) return;

    if (editingCard) {
      const updated: Project = {
        ...editingCard,
        name: formName,
        category: formCategory,
        shortDescription: formShortDesc,
        fullDescription: formFullDesc,
        country: formCountry,
        city: formCity,
        address: formAddress,
        instagram: formInstagram,
        phone: formPhone,
        whatsapp: formWhatsapp,
        telegram: formTelegram,
        deliveryInfo: formDelivery,
        photos: formPhotos,
        status: ProjectStatus.Pending,
        updatedAt: "Сегодня",
      };
      onUpdateCard(updated);
    } else {
      const nwProj = {
        name: formName,
        category: formCategory,
        shortDescription: formShortDesc,
        fullDescription: formFullDesc,
        country: formCountry,
        city: formCity,
        address: formAddress,
        instagram: formInstagram,
        phone: formPhone,
        whatsapp: formWhatsapp,
        telegram: formTelegram,
        deliveryInfo: formDelivery,
        photos: formPhotos,
        status: ProjectStatus.Pending,
      };
      onCreateCard(nwProj);
    }
    handleModalClose();
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    const samplePhotos = [
      "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1486887396153-fa416526c13b?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400",
    ];
    const newUrls = Array.from(files).map(() => samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
    setFormPhotos((prev) => [...prev, ...newUrls]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (idx: number) => setFormPhotos((prev) => prev.filter((_, i) => i !== idx));

  const filters: { key: ProjectStatus | "All"; label: string; count: number; Icon: typeof Folder; iconClass: string }[] = [
    { key: "All", label: "Вся витрина", count: totalCount, Icon: Folder, iconClass: "text-gold" },
    { key: ProjectStatus.Published, label: "Активные", count: publishedCount, Icon: CheckCircle2, iconClass: "text-green-600" },
    { key: ProjectStatus.Pending, label: "На проверке", count: pendingCount, Icon: Clock, iconClass: "text-amber-600" },
    { key: ProjectStatus.NeedsRevision, label: "Правки", count: revisionCount, Icon: AlertTriangle, iconClass: "text-red-500" },
  ];

  const metrics: { label: string; value: number; tone: "brand" | "success" | "warning" | "danger" }[] = [
    { label: "Всего визиток", value: totalCount, tone: "brand" },
    { label: "Опубликовано", value: publishedCount, tone: "success" },
    { label: "На проверке", value: pendingCount, tone: "warning" },
    { label: "Требуют правок", value: revisionCount, tone: "danger" },
  ];

  const metricValueClass: Record<string, string> = {
    brand: "text-brand",
    success: "text-green-700",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <div className="bg-canvas py-8 sm:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Profile summary & status nav */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-line rounded-lg shadow-card p-6 lg:sticky lg:top-24">
              <div className="flex flex-col items-center text-center pb-6 border-b border-line">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-canvas img-outline mb-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    alt="Аскер Хакунов"
                    onError={hideBroken}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-serif text-xl text-ink leading-tight">Аскер Хакунов</h3>
                <span className="text-[11px] font-semibold text-gold-dark uppercase tracking-widest mt-1">
                  ИП Хакунов А. Р.
                </span>
                <span className="text-sm text-ink-soft mt-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  Майкоп, Адыгея
                </span>
              </div>

              {/* Status filter nav */}
              <nav className="flex flex-row lg:flex-col gap-2 mt-6 overflow-x-auto lg:overflow-visible scrollbar-none pb-1 lg:pb-0">
                {filters.map(({ key, label, count, Icon, iconClass }) => {
                  const active = statusFilter === key;
                  return (
                    <button
                      key={String(key)}
                      onClick={() => setStatusFilter(key)}
                      className={`shrink-0 lg:w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand text-brand-fg"
                          : "bg-surface text-ink-soft border border-line hover:border-line-strong hover:text-ink"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${active ? "text-brand-fg" : iconClass}`} />
                        {label}
                      </span>
                      <span
                        className={`tabular text-xs px-2 py-0.5 rounded-full ${
                          active ? "bg-white/15 text-brand-fg" : "bg-canvas text-ink-faint"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                <div className="hidden lg:block border-t border-line my-3" />

                <button
                  onClick={() => navigate(paths.home)}
                  className="shrink-0 lg:w-full flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-sm font-medium text-ink-soft hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Выйти
                </button>
              </nav>
            </div>
          </div>

          {/* RIGHT: Main controls */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-dark">
                Кабинет предпринимателя
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-1.5 tracking-tight">
                Здравствуйте, Аскер
              </h1>
              <p className="text-ink-soft mt-1.5 max-w-xl leading-relaxed">
                Управляйте своими марками в едином реестре SiGup, отслеживайте статусы модерации и обновляйте
                предложения.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div key={m.label} className="bg-surface border border-line rounded-md shadow-sm p-5">
                  <span className="text-xs text-ink-faint uppercase tracking-wider">{m.label}</span>
                  <div className={`font-serif text-3xl mt-2 tabular ${metricValueClass[m.tone]}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Projects list panel */}
            <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6 mb-6">
                <div>
                  <h2 className="font-serif text-xl text-ink">Ваши зарегистрированные марки</h2>
                  <p className="text-sm text-ink-soft mt-0.5">
                    Изменения отображаются в каталоге SiGup после модерации.
                  </p>
                </div>
                <Button id="dashboard-add-project-btn" onClick={onOpenAddCardModal} className="shrink-0">
                  <Plus className="w-4 h-4" /> Добавить марку
                </Button>
              </div>

              {filteredAskersProjects.length === 0 ? (
                <div className="text-center py-12 rounded-md border border-dashed border-line bg-canvas">
                  <p className="text-sm text-ink-soft">В данной категории пока нет карточек.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
                        <th className="pb-3 pr-4 font-semibold">Наименование</th>
                        <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Раздел</th>
                        <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Город</th>
                        <th className="pb-3 pr-4 font-semibold hidden lg:table-cell">Обновлено</th>
                        <th className="pb-3 pr-4 font-semibold">Статус</th>
                        <th className="pb-3 text-right font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAskersProjects.map((p) => (
                        <tr
                          key={p.id}
                          id={`dashboard-table-row-${p.id}`}
                          className="border-b border-line hover:bg-canvas transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-sm bg-canvas overflow-hidden shrink-0 img-outline">
                                <img
                                  src={p.photos?.[0] ?? ""}
                                  alt=""
                                  onError={hideBroken}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-ink truncate max-w-[140px] block">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-ink-soft hidden sm:table-cell">{p.category}</td>
                          <td className="py-4 pr-4 text-ink-soft truncate hidden md:table-cell">{p.city}</td>
                          <td className="py-4 pr-4 text-ink-faint tabular hidden lg:table-cell">{p.updatedAt}</td>
                          <td className="py-4 pr-4">
                            <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(p)}
                                id={`row-edit-btn-${p.id}`}
                                title="Редактировать"
                                className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-brand hover:border-line-strong transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSelectProject(p.id)}
                                id={`row-view-btn-${p.id}`}
                                title="Посмотреть на сайте"
                                className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-brand hover:border-line-strong transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteCard(p.id)}
                                id={`row-delete-btn-${p.id}`}
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
              )}
            </div>

            {/* Notifications & account summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Moderation notifications — derived from NeedsRevision cards */}
              <div className="bg-surface border border-line rounded-lg shadow-card p-6">
                <div className="flex items-center gap-2.5 border-b border-line pb-3.5 mb-4">
                  <Bell className="w-4 h-4 text-gold" />
                  <h3 className="font-serif text-lg text-ink">Уведомления модерации</h3>
                </div>

                {revisionProjects.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-8 text-ink-faint">
                    <Inbox className="w-8 h-8 mb-2" />
                    <p className="text-sm text-ink-soft">Нет карточек, требующих правок.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {revisionProjects.map((p) => (
                      <div key={p.id} className="bg-canvas border border-line rounded-md p-4 flex gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                        <div className="flex-grow">
                          <h4 className="text-sm font-semibold text-ink">«{p.name}»</h4>
                          <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                            {p.adminComment || "Требуются доработки. Внесите изменения и отправьте на повторную проверку."}
                          </p>
                          <div className="mt-3">
                            <Button size="sm" variant="secondary" onClick={() => handleEditClick(p)}>
                              <Edit3 className="w-3.5 h-3.5" /> Редактировать
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account summary + honest completeness bar */}
              <div className="bg-surface border border-line rounded-lg shadow-card p-6 flex flex-col">
                <div className="flex items-center gap-2.5 border-b border-line pb-3.5 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                  <h3 className="font-serif text-lg text-ink">Аккаунт</h3>
                </div>

                <ul className="flex flex-col gap-2.5 text-sm">
                  <li className="flex justify-between gap-3">
                    <span className="text-ink-faint">Представитель</span>
                    <span className="font-medium text-ink text-right">Аскер Хакунов</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span className="text-ink-faint">Форма</span>
                    <span className="font-medium text-ink text-right">ИП Хакунов А. Р.</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span className="text-ink-faint">Регион</span>
                    <span className="font-medium text-ink text-right">Майкоп, Адыгея</span>
                  </li>
                </ul>

                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-ink-faint uppercase tracking-wider">
                      Опубликовано карточек
                    </span>
                    <span className="font-serif text-brand tabular">{completeness}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-canvas border border-line overflow-hidden">
                    <div className="h-full bg-brand transition-all duration-500" style={{ width: `${completeness}%` }} />
                  </div>
                  <p className="text-xs text-ink-faint mt-2 tabular">
                    {publishedCount} из {totalCount} марок в каталоге
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT modal */}
      <Modal
        open={isAddModalOpen}
        onClose={handleModalClose}
        size="lg"
        title={editingCard ? `Редактирование: ${editingCard.name}` : "Добавление марки"}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleModalClose}>
              Отменить
            </Button>
            <Button type="submit" form={FORM_ID}>
              {editingCard ? "Сохранить" : "Подать заявку"}
            </Button>
          </div>
        }
      >
        <form id={FORM_ID} onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          <Input
            label="Название фирмы или проекта *"
            required
            placeholder="Например: Сырная мастерская «Уздых»"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Раздел каталога *"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as ProjectCategory)}
            >
              {Object.values(ProjectCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Input
              label="Город / Ущелье *"
              required
              placeholder="Например: Нальчик или Майкоп"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
            />
          </div>

          <Input
            label="Краткое описание (для превью) *"
            required
            placeholder="Выпечка адыгейских пирогов по старинным рецептам."
            value={formShortDesc}
            onChange={(e) => setFormShortDesc(e.target.value)}
          />

          <Textarea
            label="Подробное описание истории и философии"
            rows={4}
            placeholder="Какое молоко используется, секреты закваски сыра или ковки металлов…"
            value={formFullDesc}
            onChange={(e) => setFormFullDesc(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instagram"
              placeholder="@adyghe_brand"
              value={formInstagram}
              onChange={(e) => setFormInstagram(e.target.value)}
            />
            <Input
              label="Контактный телефон"
              placeholder="+7 (928) 123-45-67"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          {/* Photos */}
          <div>
            <span className="block mb-1.5 text-sm font-medium text-ink">Фотографии товара или мастерской</span>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-md p-5 text-center cursor-pointer transition-colors ${
                isDragOver ? "border-brand bg-brand-muted" : "border-line hover:border-line-strong hover:bg-canvas"
              }`}
            >
              <Upload className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-sm font-medium text-ink">Перетащите фотографии сюда</p>
              <p className="text-xs text-ink-faint mt-1">До 5 снимков в формате JPG, PNG</p>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {formPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-3">
                {formPhotos.map((url, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-sm bg-canvas overflow-hidden shrink-0 img-outline">
                    <img src={url} alt="" onError={hideBroken} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Условия доставки"
            placeholder="Доставляем СДЭКом в вакуумном контейнере."
            value={formDelivery}
            onChange={(e) => setFormDelivery(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

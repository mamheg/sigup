import React, { useState, useRef } from "react";
import { Project, ProjectCategory, ProjectStatus } from "../types";
import {
  User, MapPin, Plus, Edit3, Eye, Trash2, Bell, CheckCircle2, AlertTriangle, Info,
  LineChart, Folder, Settings, LogOut, ChevronDown, Upload, X, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

export default function EntrepreneurCabinet({
  projects,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onSelectProject,
  onOpenAddCardModal,
  isAddModalOpen,
  setIsAddModalOpen
}: EntrepreneurCabinetProps) {
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
  const [formPhotos, setFormPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=400"
  ]);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");

  const askersProjects = projects.filter(p => p.authorId === "asker-khakunov");

  const filteredAskersProjects = askersProjects.filter(p => {
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
    setFormPhotos([
      "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=400"
    ]);
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
        updatedAt: "Сегодня"
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
        status: ProjectStatus.Pending
      };
      onCreateCard(nwProj);
    }
    handleModalClose();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    const newUrls = Array.from(files).map(() => {
      const samplePhotos = [
        "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1486887396153-fa416526c13b?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"
      ];
      return samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    });
    setFormPhotos(prev => [...prev, ...newUrls]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (idx: number) => {
    setFormPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="font-sans text-stone-800 bg-[#FCFBF9] py-10 sm:py-16 min-h-screen relative overflow-hidden">
      
      {/* Background hazy mist elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-[#F0F4EF]/40 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Profile summary card & Menu */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[28px] border border-[#eeeae1]/80 p-6 shadow-sm sticky top-28">
              
              <div className="flex flex-col items-center text-center pb-6 border-b border-[#eeeae1]/70">
                <div className="relative w-20 h-20 rounded-full bg-stone-50 mb-3.5 ring-4 ring-[#F0F4EF]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    alt="Аскер Хакунов"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-[#244D33] text-white rounded-full flex items-center justify-center hover:bg-[#3E6F4D] transition-colors border-2 border-white cursor-pointer">
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-base font-serif font-bold text-[#244D33] leading-snug">Аскер Хакунов</h3>
                <span className="text-[9px] font-bold text-[#c79e61] uppercase tracking-widest mt-1 block">
                  ИП Хакунов А. Р.
                </span>
                <span className="text-xs text-stone-500 mt-2 flex items-center gap-1 justify-center font-light">
                  <MapPin className="w-3.5 h-3.5 text-[#244D33]" />
                  Майкоп, Адыгея
                </span>
              </div>

              {/* Sidebar selectors */}
              <nav className="flex flex-row lg:flex-col gap-2 mt-6 text-xs uppercase tracking-wider font-semibold select-none overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => setStatusFilter("All")}
                  className={`px-4 py-2.5 lg:px-4.5 lg:py-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shrink-0 lg:w-full ${
                    statusFilter === "All"
                      ? "bg-[#244D33] text-white"
                      : "bg-[#f0ede6]/30 hover:bg-[#FCFBF9] text-stone-600 border border-[#eeeae1]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#c79e61]" />
                    <span>Вся витрина</span>
                  </div>
                  <span className={`text-[9.5px] px-2 py-0.5 rounded-full ${statusFilter === "All" ? "bg-white/15 text-white" : "bg-stone-50 text-stone-500"}`}>
                    {askersProjects.length}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter(ProjectStatus.Published)}
                  className={`px-4 py-2.5 lg:px-4.5 lg:py-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shrink-0 lg:w-full ${
                    statusFilter === ProjectStatus.Published
                      ? "bg-[#244D33] text-white"
                      : "bg-[#f0ede6]/30 hover:bg-[#FCFBF9] text-stone-600 border border-[#eeeae1]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Активные</span>
                  </div>
                  <span className="text-[9.5px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full">
                    {askersProjects.filter(p => p.status === ProjectStatus.Published).length}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter(ProjectStatus.Pending)}
                  className={`px-4 py-2.5 lg:px-4.5 lg:py-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shrink-0 lg:w-full ${
                    statusFilter === ProjectStatus.Pending
                      ? "bg-[#244D33] text-white"
                      : "bg-[#f0ede6]/30 hover:bg-[#FCFBF9] text-stone-600 border border-[#eeeae1]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#c79e61]" />
                    <span>Проверка</span>
                  </div>
                  <span className="text-[9.5px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full">
                    {askersProjects.filter(p => p.status === ProjectStatus.Pending).length}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter(ProjectStatus.NeedsRevision)}
                  className={`px-4 py-2.5 lg:px-4.5 lg:py-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shrink-0 lg:w-full ${
                    statusFilter === ProjectStatus.NeedsRevision
                      ? "bg-[#244D33] text-white"
                      : "bg-[#f0ede6]/30 hover:bg-[#FCFBF9] text-stone-600 border border-[#eeeae1]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Правки</span>
                  </div>
                  <span className="text-[9.5px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded-full">
                    {askersProjects.filter(p => p.status === ProjectStatus.NeedsRevision).length}
                  </span>
                </button>

                <div className="hidden lg:block border-t border-[#eeeae1]/70 my-4" />

                <button
                  onClick={() => setStatusFilter("All")}
                  className="px-4 py-2.5 lg:px-4.5 lg:py-3 rounded-2xl flex items-center gap-2 text-stone-500 hover:bg-rose-50/60 hover:text-rose-600 transition-all cursor-pointer shrink-0 lg:w-full"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Выйти</span>
                </button>
              </nav>
            </div>
          </div>

          {/* RIGHT: Main business controls */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c79e61]">
                Информационная панель SiGup
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#244D33] mt-1.5">
                Здравствуйте, Аскер
              </h1>
              <p className="text-stone-500 text-sm font-light mt-1 max-w-xl">
                Управляйте своими семейными брендами в едином реестре, отслеживайте статусы и обновляйте сезонные предложения.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-[20px] border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
                <span className="text-xs text-stone-400 font-light uppercase tracking-wider">Всего визиток</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-[#244D33]">18</span>
                  <span className="text-[9px] font-bold text-center text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">актив</span>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
                <span className="text-xs text-stone-400 font-light uppercase tracking-wider font-semibold">Опубликовано</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-[#244D33]">12</span>
                  <span className="text-[9px] font-bold text-center text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">в сети</span>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
                <span className="text-xs text-stone-400 font-light uppercase tracking-wider">На проверке</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-amber-600">2</span>
                  <span className="text-[9px] font-bold text-center text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">ждёт</span>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
                <span className="text-xs text-stone-400 font-light uppercase tracking-wider">В черновиках</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-stone-400">3</span>
                  <span className="text-[9px] font-bold text-center text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">скрыто</span>
                </div>
              </div>
            </div>

            {/* List panel */}
            <div className="bg-white rounded-[32px] border border-[#eeeae1]/80 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#eeeae1]/70 pb-6 mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#244D33]">Ваши зарегистрированные марки</h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">Вносите изменения, которые отображаются на сайте SiGup в реальном времени.</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenAddCardModal}
                  id="dashboard-add-project-btn"
                  className="bg-[#244D33] hover:bg-[#3E6F4D] text-white px-6 py-3 rounded-full font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Добавить марку</span>
                </motion.button>
              </div>

              {filteredAskersProjects.length === 0 ? (
                <div className="text-center py-12 bg-[#FCFBF9]/50 rounded-2xl border border-dashed border-[#eeeae1] p-6">
                  <p className="text-xs text-stone-500 font-light">В данной категории пока нет активных карточек.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs sm:text-sm text-stone-850 font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-[#eeeae1] text-[10px] font-bold tracking-widest uppercase text-stone-400 pb-3">
                        <th className="pb-3.5 pr-4 font-semibold">Наименование</th>
                        <th className="pb-3.5 pr-4 font-semibold hidden sm:table-cell">Раздел</th>
                        <th className="pb-3.5 pr-4 font-semibold hidden md:table-cell">Город</th>
                        <th className="pb-3.5 pr-4 font-semibold hidden lg:table-cell">Обновлено</th>
                        <th className="pb-3.5 pr-4 font-semibold">Статус</th>
                        <th className="pb-3.5 text-right font-semibold">Правка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAskersProjects.map((p) => {
                        const isPublished = p.status === ProjectStatus.Published;
                        const isPending = p.status === ProjectStatus.Pending;

                        return (
                          <tr key={p.id} id={`dashboard-table-row-${p.id}`} className="border-b border-[#eeeae1]/50 hover:bg-[#FCFBF9]/80 transition-colors">
                            <td className="py-4 pr-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#F0F4EF] overflow-hidden shrink-0">
                                <img src={p.photos ? p.photos[0] : ""} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="font-serif font-bold text-[#244D33] truncate max-w-[120px] sm:max-w-[140px] block leading-tight">
                                {p.name}
                              </span>
                            </td>

                            <td className="py-4 pr-4 text-stone-500 text-xs font-light hidden sm:table-cell">{p.category}</td>
                            <td className="py-4 pr-4 text-stone-500 text-xs font-light truncate hidden md:table-cell">{p.city}</td>
                            <td className="py-4 pr-4 text-stone-400 text-xs font-mono hidden lg:table-cell">{p.updatedAt}</td>

                            <td className="py-4 pr-4">
                              <span
                                className={`text-[9.5px] font-bold uppercase tracking-widest py-1 px-3 rounded-full leading-none inline-block border ${
                                  isPublished
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : isPending
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>

                            <td className="py-4 text-right flex items-center justify-end gap-1.5 h-full">
                              <button
                                onClick={() => handleEditClick(p)}
                                id={`row-edit-btn-${p.id}`}
                                className="w-8 h-8 rounded-full border border-[#eeeae1] flex items-center justify-center text-stone-500 hover:text-[#244D33] hover:bg-[#F0F4EF]/40 transition-colors cursor-pointer"
                                title="Редактировать форму"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSelectProject(p.id)}
                                id={`row-view-btn-${p.id}`}
                                className="w-8 h-8 rounded-full border border-[#eeeae1] flex items-center justify-center text-stone-500 hover:text-[#244D33] hover:bg-[#F0F4EF]/40 transition-colors cursor-pointer"
                                title="Посмотреть на сайте"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteCard(p.id)}
                                id={`row-delete-btn-${p.id}`}
                                className="w-8 h-8 rounded-full border border-[#eeeae1] flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                                title="Удалить визитку"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notifications & Accounts Health blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Notifications */}
              <div className="bg-white rounded-[28px] border border-[#eeeae1]/80 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-[#eeeae1]/70 pb-3.5 mb-4 select-none">
                  <Bell className="w-4.5 h-4.5 text-[#c79e61]" />
                  <h3 className="text-base font-serif font-bold text-[#244D33]">Уведомления модерации</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-[#FCFBF9] p-4 rounded-2xl border border-[#eeeae1]/60 flex gap-3 flex-col sm:flex-row items-start">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold text-[#244D33]">«Фестиваль адыгского сыра»</h4>
                      <p className="text-xs text-stone-500 mt-1 font-light leading-relaxed">
                        Укажите время работы, а также контакты организатора ярмарки в Нальчике. Ожидаем правку.
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-3.5 text-[9px] text-[#c79e61] font-mono uppercase tracking-wider">
                        <span>25 мая 2025</span>
                        <button
                          onClick={() => {
                            const p = askersProjects.find(item => item.id === "festival-cheese");
                            if (p) handleEditClick(p);
                          }}
                          className="font-bold hover:text-[#244D33] cursor-pointer"
                        >
                          Редактировать
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FCFBF9] p-4 rounded-2xl border border-[#eeeae1]/60 flex gap-3 flex-col sm:flex-row items-start">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold text-[#244D33]">«Уздых» успешно опубликована</h4>
                      <p className="text-xs text-stone-500 mt-1 font-light leading-relaxed">
                        Семейная марка прошла модерацию и доступна миллионам земляков!
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-3 text-[9px] text-emerald-700 font-mono font-bold tracking-wider uppercase">
                        <span>15 мая 2025</span>
                        <span>Готово</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Profile completeness metrics */}
              <div className="bg-white rounded-[28px] border border-[#eeeae1]/80 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 border-b border-[#eeeae1]/70 pb-3.5 mb-4 select-none">
                    <User className="w-4.5 h-4.5 text-[#244D33]" />
                    <h3 className="text-base font-serif font-bold text-[#244D33]">Пароли & Безопасность</h3>
                  </div>

                  <ul className="text-xs text-stone-600 font-light flex flex-col gap-2.5">
                    <li className="flex justify-between">
                      <span className="text-stone-400">Представитель:</span>
                      <span className="font-semibold text-[#244D33]">Аскер Русланович Х.</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-stone-400">Номер телефона:</span>
                      <span className="font-semibold text-stone-850">+7 (928) 123-45-67</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-stone-400">Официальный Email:</span>
                      <span className="font-semibold text-stone-850">asker.hakunov@mail.ru</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#eeeae1]/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Заполненность</span>
                    <span className="text-xs font-serif font-bold text-[#244D33]">85%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#FCFBF9] border border-[#eeeae1] overflow-hidden">
                    <div className="h-full bg-[#244D33] transition-all duration-500" style={{ width: "85%" }}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-stone-500 uppercase tracking-widest mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 text-xs">✓</span> Контакты
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 text-xs">✓</span> Мастерская
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 text-xs">✓</span> Фото галерея
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 text-xs">✓</span> Описание
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT CARD MODAL Overlay */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-2xl max-w-2xl w-full border border-[#eeeae1]/80"
            >
              {/* Form header */}
              <div className="bg-[#244D33] text-white px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#FCFBF9]">
                    {editingCard ? `Редактирование: ${editingCard.name}` : "Добавление ремесленной марки"}
                  </h3>
                  <p className="text-xs text-stone-300 font-light mt-0.5">
                    {editingCard ? "Внесите изменения и мы заново опубликуем карточку." : "Заполните визитку вашего бренда для национальной витрины."}
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form entries scroll container */}
              <form onSubmit={handleFormSubmit} className="p-6 max-h-[72vh] overflow-y-auto flex flex-col gap-5 text-xs sm:text-sm text-stone-700">
                
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Название фирмы или проекта *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Сырная мастерская «Уздых»"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 pb-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                      Раздел каталога *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProjectCategory)}
                      className="w-full border border-[#eeeae1] rounded-2xl px-3 py-3 bg-[#FCFBF9] text-stone-800 outline-none"
                    >
                      {Object.values(ProjectCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                      Город / Ущелье *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Нальчик или Майкоп"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Краткое описание (для превью плитки) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Выпечка адыгейских пирогов по старинным рецептам на дровах."
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Подробное описание истории и философии изделий
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Какое молоко используется, секреты закваски сыра или ковки металлов..."
                    value={formFullDesc}
                    onChange={(e) => setFormFullDesc(e.target.value)}
                    className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                      Контакты Instagram
                    </label>
                    <input
                      type="text"
                      placeholder="@adyghe_brand"
                      value={formInstagram}
                      onChange={(e) => setFormInstagram(e.target.value)}
                      className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                      Контактный телефон *
                    </label>
                    <input
                      type="text"
                      placeholder="+7 (928) 123-45-67"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9]"
                    />
                  </div>
                </div>

                {/* Drag-and-drop Image Area */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Фотографии процесса производства или вывески мастерской
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? "border-[#244D33] bg-[#244D33]/5"
                        : "border-[#eeeae1] hover:border-[#c79e61]/50 hover:bg-[#FCFBF9]"
                    }`}
                  >
                    <Upload className="w-6 h-6 text-[#c79e61] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-700">Перетащите фотографии ущелья или товара сюда</p>
                    <p className="text-[10px] text-stone-400 mt-1 font-light">До 5 снимков в формате JPG, PNG</p>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {formPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3 select-none">
                      {formPhotos.map((url, i) => (
                        <div key={i} className="relative w-12 h-12 rounded-xl bg-stone-50 overflow-hidden shrink-0 border border-[#eeeae1]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(i);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Условия курьерской или почтовой доставки
                  </label>
                  <input
                    type="text"
                    placeholder="Доставляем СДЭКом в вакуумном контейнере."
                    value={formDelivery}
                    onChange={(e) => setFormDelivery(e.target.value)}
                    className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#244D33]/10 focus:border-[#244D33] outline-none bg-[#FCFBF9]"
                  />
                </div>

                {/* Form actions */}
                <div className="border-t border-[#eeeae1] pt-5 mt-4 flex items-center justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2.5 border border-[#eeeae1] rounded-full text-stone-500 hover:bg-stone-50 transition-colors font-semibold cursor-pointer"
                  >
                    Отменить
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="px-6 py-2.5 bg-[#244D33] hover:bg-[#3E6F4D] text-white rounded-full font-semibold uppercase tracking-widest text-[11px] cursor-pointer"
                  >
                    {editingCard ? "Сохранить бренд" : "Подать заявку"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

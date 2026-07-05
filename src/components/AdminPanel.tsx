import React, { useState } from "react";
import { Project, ProjectCategory, ProjectStatus, EventItem } from "../types";
import {
  Check, X, Edit2, Users, FolderCheck, CalendarRange, Clock, AlertCircle, ArrowUpRight,
  TrendingUp, ArrowRight, Layers, FileText, ChevronDown, CheckSquare, Plus, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  projects: Project[];
  events: EventItem[];
  onApproveProject: (id: string) => void;
  onRejectProject: (id: string, comment: string) => void;
  onSelectProject: (id: string) => void;
}

export default function AdminPanel({
  projects,
  events,
  onApproveProject,
  onRejectProject,
  onSelectProject
}: AdminPanelProps) {
  const [commentingProjectId, setCommentingProjectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "moderation" | "users">("dashboard");

  const pendingProjects = projects.filter(p => p.status === ProjectStatus.Pending);

  const handleApprove = (id: string) => {
    onApproveProject(id);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentingProjectId && rejectComment) {
      onRejectProject(commentingProjectId, rejectComment);
      setCommentingProjectId(null);
      setRejectComment("");
    }
  };

  const statsList = {
    underVerificationCount: pendingProjects.length,
    publishedCount: projects.filter(p => p.status === ProjectStatus.Published).length,
    entrepreneursCount: 892,
    eventsCount: events.length
  };

  return (
    <div className="font-sans text-stone-800 bg-[#FCFBF9] min-h-screen relative overflow-hidden pb-16">
      
      {/* Upper header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#eeeae1]/80 px-6 py-4.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#244D33] text-amber-100 font-serif font-black flex items-center justify-center text-sm select-none font-sans">
            АД
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#c79e61]">Контроль витрин</h4>
            <span className="text-sm font-serif font-bold text-[#244D33]">Администратор SiGup</span>
          </div>
        </div>

        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 select-none">
          Статус: Активен (admin@sigup.ru)
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Tab switches */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[28px] border border-[#eeeae1]/80 p-5 shadow-sm sticky top-28">
              <nav className="flex flex-col gap-1 text-xs uppercase tracking-wider font-semibold select-none">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full text-left px-4.5 py-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-[#244D33] text-white"
                      : "hover:bg-[#FCFBF9] text-stone-600"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0 text-[#c79e61]" />
                  <span>Общий дашборд</span>
                </button>

                <button
                  onClick={() => setActiveTab("moderation")}
                  className={`w-full text-left px-4.5 py-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "moderation"
                      ? "bg-[#244D33] text-white"
                      : "hover:bg-[#FCFBF9] text-stone-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderCheck className="w-4 h-4 shrink-0 text-[#c79e61]" />
                    <span>На модерации</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${activeTab === "moderation" ? "bg-white/20 text-white" : "bg-[#c79e61] text-white"}`}>
                    {pendingProjects.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full text-left px-4.5 py-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === "users"
                      ? "bg-[#244D33] text-white"
                      : "hover:bg-[#FCFBF9] text-stone-600"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-[#c79e61]" />
                  <span>База ремесленников</span>
                </button>

                <div className="border-t border-[#eeeae1]/70 my-4" />

                <div className="text-[9px] uppercase font-bold tracking-widest text-[#c79e61] px-4.5 mb-2">
                  Дополнительно
                </div>

                <a href="#afisha" className="px-4.5 py-2.5 rounded-xl hover:bg-stone-50 text-stone-500 font-medium normal-case flex items-center gap-2.5">
                  <CalendarRange className="w-4 h-4 text-[#244D33]/70" />
                  <span>Афиша мероприятий</span>
                </a>
                <a href="#announcements" className="px-4.5 py-2.5 rounded-xl hover:bg-stone-50 text-stone-500 font-medium normal-case flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#244D33]/70" />
                  <span>Объявления</span>
                </a>
              </nav>
            </div>
          </div>

          {/* RIGHT: Selected view container */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#c79e61]">
                Административный терминал
              </span>
              <h1 className="text-3xl font-serif font-bold text-[#244D33] mt-1">
                {activeTab === "dashboard" ? "Сводная аналитика" : activeTab === "moderation" ? `Проверка заявок (${pendingProjects.length})` : "Реестр ремесленников"}
              </h1>
              <p className="text-stone-500 text-sm font-light mt-1">
                Контроль соответствия локальных брендов, верификация географического происхождения и традиционных кавказских стандартов.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Новые заявки</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-[#244D33]">{statsList.underVerificationCount}</span>
                  <span className="text-[10px] text-stone-500">ожидают</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">База витрин</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-[#244D33]">1,248</span>
                  <span className="text-[9px] text-[#244D33] bg-[#F0F4EF] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">+36 нов</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Участники</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-[#244D33]">892</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">ИП / ЛПХ</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#eeeae1] p-5 shadow-sm flex flex-col justify-between h-28">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Афиша событий</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold font-serif text-[#244D33]">74</span>
                  <span className="text-[9px] text-[#244D33] bg-[#F0F4EF] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">сезон</span>
                </div>
              </div>
            </div>

            {/* Moderation section list */}
            {(activeTab === "dashboard" || activeTab === "moderation") && (
              <div className="bg-white rounded-[32px] border border-[#eeeae1]/80 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-[#eeeae1]/70 pb-5 mb-5 select-none">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#244D33]">Очередь верификации</h3>
                    <p className="text-xs text-stone-500 font-light mt-0.5">Карточки, поданные семейными делами. Одобрение делает их доступными в каталоге.</p>
                  </div>
                  {pendingProjects.length > 0 && (
                    <span className="text-[10px] font-bold text-center text-amber-700 bg-amber-50 uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100">
                      Ждут решения
                    </span>
                  )}
                </div>

                {pendingProjects.length === 0 ? (
                  <div className="text-center py-16 bg-[#FCFBF9]/50 rounded-2xl border border-dashed border-[#eeeae1] p-6">
                    <CheckCircle className="w-10 h-10 text-[#244D33]/70 mx-auto mb-3" />
                    <h4 className="text-base font-serif font-bold text-[#244D33]">Очередь проверок пуста</h4>
                    <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto font-light">
                      Все заявки успешно рассмотрены модератором и размещены на витрине.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs sm:text-sm text-stone-850 font-sans border-collapse">
                      <thead>
                        <tr className="border-b border-[#eeeae1] text-[10px] font-bold tracking-widest uppercase text-stone-400 pb-3">
                          <th className="pb-3.5 pr-4 font-semibold">Бренд / Вывеска</th>
                          <th className="pb-3.5 pr-4 font-semibold hidden sm:table-cell">Категория</th>
                          <th className="pb-3.5 pr-4 font-semibold hidden md:table-cell">Инициатор</th>
                          <th className="pb-3.5 pr-4 font-semibold hidden lg:table-cell">Локация</th>
                          <th className="pb-3.5 pr-4 font-semibold">Статус</th>
                          <th className="pb-3.5 text-right font-semibold">Действие</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingProjects.map((p) => (
                           <tr key={p.id} id={`admin-queue-row-${p.id}`} className="border-b border-[#eeeae1]/50 hover:bg-[#FCFBF9]/70 transition-colors">
                            <td className="py-4 pr-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#F0F4EF] overflow-hidden shrink-0">
                                <img src={p.photos ? p.photos[0] : ""} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span
                                onClick={() => onSelectProject(p.id)}
                                className="font-serif font-bold text-[#244D33] hover:text-[#c79e61] cursor-pointer transition-colors block leading-tight truncate max-w-[125px] sm:max-w-[140px]"
                              >
                                {p.name}
                              </span>
                            </td>

                            <td className="py-4 pr-4 text-xs text-stone-500 font-light hidden sm:table-cell">{p.category}</td>
                            <td className="py-4 pr-4 text-xs text-stone-600 font-semibold hidden md:table-cell">{p.authorName}</td>
                            <td className="py-4 pr-4 text-xs text-stone-500 font-light truncate max-w-[100px] hidden lg:table-cell">{p.city}</td>

                            <td className="py-4 pr-4">
                              <span className="text-[9.5px] font-bold uppercase tracking-widest py-1 px-3 rounded-full bg-amber-50 text-amber-700 border border-amber-100 leading-none">
                                проверка
                              </span>
                            </td>

                            <td className="py-4 text-right flex items-center justify-end gap-1.5 h-full">
                              <button
                                onClick={() => handleApprove(p.id)}
                                id={`admin-approve-btn-${p.id}`}
                                className="w-7.5 h-7.5 rounded-full bg-[#244D33] hover:bg-[#3E6F4D] text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Одобрить бренд"
                              >
                                <Check className="w-3.5 h-3.5 text-white" />
                              </button>

                              <button
                                onClick={() => onSelectProject(p.id)}
                                id={`admin-view-btn-${p.id}`}
                                className="w-7.5 h-7.5 rounded-full border border-[#eeeae1] flex items-center justify-center text-stone-500 hover:text-[#244D33] hover:bg-[#FCFBF9] cursor-pointer"
                                title="Посмотреть"
                              >
                                <Plus className="w-3.5 h-3.5 transform rotate-45" />
                              </button>

                              <button
                                onClick={() => setCommentingProjectId(p.id)}
                                id={`admin-reject-btn-${p.id}`}
                                className="w-7.5 h-7.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                                title="Отклонить с замечаниями"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Logs & category overview below */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-[28px] border border-[#eeeae1]/80 p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-[#eeeae1]/70 pb-3.5 mb-4 select-none">
                    <Clock className="w-4.5 h-4.5 text-[#244D33]" />
                    <h3 className="text-base font-serif font-bold text-[#244D33]">Журнал активности</h3>
                  </div>

                  <div className="flex flex-col gap-4 text-xs font-light text-stone-600">
                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <strong>Подана заявка:</strong> Сырная лавка «Уздых» обновила контакты
                        <p className="text-[9px] tracking-wide text-stone-400 font-mono mt-0.5">Сегодня, 10:11</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <strong>Одобрено:</strong> Горная пасека Нальчик успешно размещена на главной
                        <p className="text-[9px] tracking-wide text-stone-400 font-mono mt-0.5">Вчера, 17:10</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                      <div>
                        <strong>Обновление:</strong> Карточка ZEPHYR Parfum заполнила реквизиты доставки
                        <p className="text-[9px] tracking-wide text-stone-400 font-mono mt-0.5">Вчера, 14:24</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[28px] border border-[#eeeae1]/80 p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-[#eeeae1]/70 pb-3.5 mb-4 select-none">
                    <Layers className="w-4.5 h-4.5 text-[#244D33]" />
                    <h3 className="text-base font-serif font-bold text-[#244D33]">Сферы деятельности</h3>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div>
                      <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>Народные промыслы</span>
                        <strong className="font-serif">342 витрины</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#FCFBF9] border border-[#eeeae1] overflow-hidden">
                        <div className="h-full bg-[#244D33]" style={{ width: "80%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>Кавказские фермеры</span>
                        <strong className="font-serif">285 витрин</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#FCFBF9] border border-[#eeeae1] overflow-hidden">
                        <div className="h-full bg-[#244D33]" style={{ width: "65%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>Мастерские и ковка</span>
                        <strong className="font-serif">198 витрин</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#FCFBF9] border border-[#eeeae1] overflow-hidden">
                        <div className="h-full bg-[#244D33]" style={{ width: "45%" }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Users Registered Tab */}
            {activeTab === "users" && (
              <div className="bg-white rounded-[32px] border border-[#eeeae1]/80 p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-serif font-bold text-[#244D33] mb-4 pb-3 border-b border-[#eeeae1]/70">
                  Зарегистрированные ремесленники
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-[#FCFBF9] rounded-2xl border border-[#eeeae1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#244D33]">Аскер Русланович Хакунов</h4>
                      <p className="text-xs text-stone-400 font-light">Майкоп, Адыгея • asker.hakunov@mail.ru • +7 (928) 123-45-67</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full leading-none self-start sm:self-center">Активен</span>
                  </div>

                  <div className="p-4 bg-[#FCFBF9] rounded-2xl border border-[#eeeae1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#244D33]">Милана Тхаго</h4>
                      <p className="text-xs text-stone-400 font-light">Стамбул, Турция • m.tkhago@zephyr.co • +90 (532) 000-11-22</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full leading-none self-start sm:self-center">Активен</span>
                  </div>

                  <div className="p-4 bg-[#FCFBF9] rounded-2xl border border-[#eeeae1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#244D33]">Темир Карданов</h4>
                      <p className="text-xs text-stone-400 font-light">Нальчик, КБР • temir.kardan@gmail.com • +7 (905) 555-44-33</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full leading-none self-start sm:self-center">Активен</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK REJECT REASON DIALOG MODAL */}
      <AnimatePresence>
        {commentingProjectId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-2xl max-w-md w-full border border-[#eeeae1]/80"
            >
              <div className="bg-rose-600 text-white px-6 py-5">
                <h3 className="text-base font-serif font-bold text-white">Указать причину доработки</h3>
                <p className="text-xs text-rose-100 font-light mt-1">Опишите владельцу дела, какие моменты необходимо поправить.</p>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 flex flex-col gap-4 text-xs sm:text-sm text-stone-700">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Комментарий для партнера</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Например: Пожалуйста, уточните состав комплекта или загрузите более высокое качество снимков..."
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    className="w-full border border-[#eeeae1] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none bg-[#FCFBF9] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                       setCommentingProjectId(null);
                       setRejectComment("");
                    }}
                    className="px-4.5 py-2.5 border border-[#eeeae1] rounded-full text-stone-500 hover:bg-stone-50 font-semibold cursor-pointer"
                  >
                    Отклонить
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold uppercase tracking-widest text-[10px] cursor-pointer"
                  >
                    Выставить замечание
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

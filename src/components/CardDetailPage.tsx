import React, { useState, useEffect } from "react";
import { Project, ProjectCategory } from "../types";
import {
  MapPin, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, Instagram,
  Send, Phone, Globe, ShieldCheck, Truck, HelpCircle, Heart, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CardDetailPageProps {
  project: Project;
  allProjects: Project[];
  onSelectProject: (projectId: string) => void;
  onBack: () => void;
  onOpenAddCardModal: () => void;
}

export default function CardDetailPage({
  project,
  allProjects,
  onSelectProject,
  onBack,
  onOpenAddCardModal
}: CardDetailPageProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"about" | "products" | "delivery" | "contacts">("about");
  const [mapZoom, setMapZoom] = useState(13);

  // Reset photo index and tab on project switch
  useEffect(() => {
    setActivePhotoIndex(0);
    setActiveTab("about");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [project.id]);

  const nextPhoto = () => {
    if (project.photos && project.photos.length > 0) {
      setActivePhotoIndex(prev => (prev + 1) % project.photos.length);
    }
  };

  const prevPhoto = () => {
    if (project.photos && project.photos.length > 0) {
      setActivePhotoIndex(prev => (prev - 1 + project.photos.length) % project.photos.length);
    }
  };

  // Filter similar projects within identical category
  const similarProjects = allProjects
    .filter(p => p.id !== project.id && p.status === "Опубликовано")
    .slice(0, 4);

  const benefits = [
    { text: "Натуральные ингредиенты", num: "100%" },
    { text: "Традиционные рецепты", num: "Адыгэ" },
    { text: "Ручная работа", num: "Мастер" },
    { text: "Без добавок", num: "Эко" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="font-sans text-stone-800 bg-[#FCFBF9] py-10 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Elegant Breadcrumbs */}
        <nav className="text-xs text-stone-400 mb-8 flex items-center gap-2 select-none tracking-wider uppercase font-light">
          <button onClick={onBack} id="back-to-home-link" className="hover:text-[#244D33] transition-colors cursor-pointer">Главная</button>
          <span>/</span>
          <button onClick={onBack} id="back-to-catalog-link" className="hover:text-[#244D33] transition-colors cursor-pointer">Каталог</button>
          <span>/</span>
          <span className="text-[#244D33] font-semibold">{project.category}</span>
          <span>/</span>
          <span className="text-stone-500 truncate max-w-[150px] sm:max-w-xs">{project.name}</span>
        </nav>

        {/* Top Header Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          
          {/* LEFT: Photos & Thumbnails Slider */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Main Picture Box */}
            <div className="relative aspect-[4/3] bg-stone-50 rounded-[28px] overflow-hidden shadow-sm border border-[#eeeae1]/80 select-none group">
              <img
                src={project.photos && project.photos.length > 0 ? project.photos[activePhotoIndex] : "https://images.unsplash.com/photo-1528256846555-830fcee766aa?auto=format&fit=crop&q=80&w=800"}
                alt={project.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Slider photos counter */}
              <div className="absolute top-4 left-4 bg-[#FCFBF9]/90 backdrop-blur-sm text-[#244D33] font-mono text-xs px-3.5 py-1 rounded-full border border-[#eeeae1]/60">
                {activePhotoIndex + 1} / {project.photos?.length || 1}
              </div>

              {/* Navigation Arrows */}
              {project.photos && project.photos.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevPhoto}
                    id="slider-prev-btn"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow flex items-center justify-center text-[#244D33] hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextPhoto}
                    id="slider-next-btn"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow flex items-center justify-center text-[#244D33] hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>

            {/* Thumbnails preview list */}
            {project.photos && project.photos.length > 1 && (
              <div className="grid grid-cols-5 gap-3 select-none">
                {project.photos.map((ph, idx) => (
                  <button
                    key={idx}
                    id={`thumb-btn-${idx}`}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`aspect-[4/3] rounded-[16px] overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activePhotoIndex === idx
                        ? "border-[#c79e61] shadow-sm transform scale-[1.02]"
                        : "border-transparent hover:border-stone-300"
                    }`}
                  >
                    <img src={ph} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Quick Summary Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            <div className="bg-white rounded-[32px] border border-[#eeeae1]/75 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="bg-[#F0F4EF] text-[#244D33] text-[9px] font-bold uppercase tracking-widest py-1.5 px-3.5 rounded-full border border-[#eeeae1]/40">
                  {project.category}
                </span>

                {/* Verification level badge */}
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 border border-emerald-100 rounded-full px-3.5 py-1 text-[11px] font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Проверено SiGup</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#244D33] mt-5 leading-tight">
                {project.name}
              </h1>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mt-3.5 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#c79e61]" />
                <span>г. {project.city}, Кавказский регион</span>
              </div>

              <div className="border-t border-[#eeeae1]/70 my-5" />

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                {project.shortDescription}
              </p>

              {/* Direct channels call block */}
              <div className="mt-8">
                <motion.a
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/${project.whatsapp || "79281234567"}`}
                  target="_blank"
                  rel="noreferrer"
                  id="primary-contact-btn"
                  className="w-full bg-[#244D33] hover:bg-[#3E6F4D] text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md text-sm uppercase tracking-widest cursor-pointer"
                >
                  <MessageSquare className="w-4.5 h-4.5 text-[#c79e61]" />
                  <span>Начать диалог</span>
                </motion.a>
              </div>

              {/* Direct communication icons row */}
              <div className="grid grid-cols-5 gap-2 mt-4 text-center">
                <motion.a
                  whileHover={{ scale: 1.03, backgroundColor: "#FCFBF9" }}
                  href={`https://instagram.com/${project.instagram?.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  id="link-inst"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#eeeae1]/60 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-[#c79e61]" />
                  <span className="text-[9px] font-bold text-[#244D33] uppercase tracking-widest leading-none mt-1">Inst</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.03, backgroundColor: "#FCFBF9" }}
                  href={`https://wa.me/${project.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  id="link-wa"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#eeeae1]/60 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#c79e61]" />
                  <span className="text-[9px] font-bold text-[#244D33] uppercase tracking-widest leading-none mt-1">WA</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.03, backgroundColor: "#FCFBF9" }}
                  href={`https://t.me/${project.telegram}`}
                  target="_blank"
                  rel="noreferrer"
                  id="link-tg"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#eeeae1]/60 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#c79e61]" />
                  <span className="text-[9px] font-bold text-[#244D33] uppercase tracking-widest leading-none mt-1">TG</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.03, backgroundColor: "#FCFBF9" }}
                  href={`tel:${project.phone}`}
                  id="link-phone"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#eeeae1]/60 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#c79e61]" />
                  <span className="text-[9px] font-bold text-[#244D33] uppercase tracking-widest leading-none mt-1">Call</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.03, backgroundColor: "#FCFBF9" }}
                  href={`https://${project.website || "google.com"}`}
                  target="_blank"
                  rel="noreferrer"
                  id="link-web"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#eeeae1]/60 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#c79e61]" />
                  <span className="text-[9px] font-bold text-[#244D33] uppercase tracking-widest leading-none mt-1">Web</span>
                </motion.a>
              </div>
            </div>

            {/* Quick Pricing Lists */}
            <div className="flex flex-col gap-3.5">
              <div className="bg-white rounded-3xl border border-[#eeeae1]/75 p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F4EF] flex items-center justify-center text-[#244D33] shrink-0 font-serif font-bold text-lg select-none">
                  ₽
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#244D33] leading-none mt-1">
                    Цены уточняйте напрямую
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1.5 font-light">
                    {project.priceInfo || "Цены формируются мастером без наценок. Уточняйте в WhatsApp/Telegram."}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#eeeae1]/75 p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F4EF] flex items-center justify-center text-[#244D33] shrink-0">
                  <Truck className="w-4.5 h-4.5 text-[#c79e61]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#244D33] leading-none mt-1">
                    Горная и глобальная доставка
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1.5 font-light">
                    {project.deliveryInfo || "Самовывоз по городу, СДЭК, Почта России в любой город мира."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection Area */}
        <section className="bg-white rounded-[32px] border border-[#eeeae1]/75 shadow-sm overflow-hidden mb-12">
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-[#eeeae1]/70 select-none bg-[#eeeae1]/30">
            {(["about", "products", "delivery", "contacts"] as const).map((tab) => {
              const RussianLabels = {
                about: "О мастере",
                products: "Витрина товаров",
                delivery: "Доставка & Оплата",
                contacts: "Контакты фирмы"
              };
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    // Also scroll into view slightly on click for better accessibility
                    document.getElementById(`details-tab-${tab}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                  }}
                  id={`details-tab-${tab}`}
                  className={`px-5 sm:px-6 py-4 uppercase tracking-widest font-bold text-[10px] sm:text-xs border-b-2 transition-all cursor-pointer relative shrink-0 ${
                    isSelected
                      ? "border-[#244D33] text-[#244D33] bg-white text-semibold"
                      : "border-transparent text-stone-400 hover:text-[#244D33]"
                  }`}
                >
                  {RussianLabels[tab]}
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                >
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#244D33] mb-4">История семейного дела</h3>
                      <p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
                        {project.fullDescription}
                      </p>
                    </div>

                    {/* Quality benefits */}
                    <div className="grid grid-cols-2 gap-4">
                      {benefits.map((b, index) => (
                        <div key={index} className="flex items-center gap-3.5 bg-[#FCFBF9] p-4.5 rounded-2xl border border-[#eeeae1]/75">
                          <div className="w-9 h-9 rounded-full bg-[#244D33] text-[#FCFBF9] flex items-center justify-center font-serif font-bold text-xs select-none">
                            {b.num}
                          </div>
                          <span className="text-xs font-bold text-[#244D33] uppercase tracking-wider leading-tight">
                            {b.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Caucasus Mountain Map Canvas Frame */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <h3 className="text-xl font-serif font-bold text-[#244D33] leading-none">География & Адрес фирмы</h3>
                    <p className="text-xs text-stone-500 font-light leading-normal">
                      {project.address || "Республика Адыгея, г. Майкоп"}
                    </p>

                    <div className="relative h-64 bg-[#efebe4] rounded-2xl border border-[#eeeae1] overflow-hidden shadow-inner select-none">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#e2ddd5" strokeWidth="1">
                          <line x1="0" y1="50" x2="400" y2="50" />
                          <line x1="0" y1="100" x2="400" y2="100" />
                          <line x1="0" y1="150" x2="400" y2="150" />
                          <line x1="0" y1="200" x2="400" y2="200" />
                          <line x1="80" y1="0" x2="80" y2="300" />
                          <line x1="160" y1="0" x2="160" y2="300" />
                          <line x1="240" y1="0" x2="240" y2="300" />
                        </g>

                        {/* River Belaya simulation in Maykop */}
                        <path
                          d="M -20,200 Q 150,180 200,100 T 420,40"
                          fill="none"
                          stroke="#c5daf8"
                          strokeWidth="12"
                          opacity="0.8"
                        />
                        <text x="210" y="80" fill="#7ba2cc" className="text-[9px] font-mono italic">р. Белая</text>

                        {/* Main streets */}
                        <path d="M 0,110 L 400,110" fill="none" stroke="#FCFBF9" strokeWidth="6" />
                        <text x="35" y="104" fill="#a09b85" className="text-[8px] font-bold tracking-widest uppercase">Шовгенова</text>

                        <path d="M 120,0 L 120,300" fill="none" stroke="#FCFBF9" strokeWidth="6" />
                        <text x="126" y="240" fill="#a09b85" className="text-[8px] font-bold tracking-widest uppercase origin-center rotate-90">Хакурате</text>

                        {/* Traditional styled custom circle target pin */}
                        <circle cx="160" cy="110" r="16" fill="#244D33" fillOpacity="0.15" />
                        <circle cx="160" cy="110" r="4" fill="#244D33" />
                        <path d="M160,110 L160,95 C156,95 153,98 153,102 C153,106 160,110 160,110 Z" fill="#c79e61" />
                        <circle cx="160" cy="102" r="1.5" fill="#FFFFFF" />

                        {/* Target name badge */}
                        <rect x="180" y="93" width="95" height="22" rx="6" fill="#244D33" />
                        <text x="186" y="107" fill="#FCFBF9" className="text-[9px] font-semibold tracking-wider uppercase font-mono">Производство</text>
                      </svg>

                      {/* Map Controls */}
                      <div className="absolute right-3 bottom-3 flex flex-col gap-1">
                        <button
                          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
                          className="w-7 h-7 rounded-lg bg-white border border-[#eeeae1] flex items-center justify-center font-bold text-sm text-stone-700 hover:bg-[#FCFBF9] cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setMapZoom(prev => Math.max(prev - 1, 8))}
                          className="w-7 h-7 rounded-lg bg-white border border-[#eeeae1] flex items-center justify-center font-bold text-sm text-stone-700 hover:bg-[#FCFBF9] cursor-pointer"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "products" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-xl font-serif font-bold text-[#244D33] mb-6">Каталог товаров ({project.products?.length || 0})</h3>
                  {project.products && project.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {project.products.map((item) => (
                        <motion.div
                          whileHover={{ y: -3 }}
                          key={item.id}
                          id={`product-card-${item.id}`}
                          className="bg-white rounded-3xl overflow-hidden border border-[#eeeae1]/85 p-2.5 shadow-sm relative hover:border-[#c79e61]/35 duration-500 transition-all"
                        >
                          <div className="relative aspect-[4/3] bg-stone-50 rounded-2xl overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm font-bold text-stone-900 truncate">{item.name}</h4>
                            <p className="text-xs text-[#c79e61] font-bold mt-1 uppercase tracking-wider">
                              {item.price}
                            </p>
                            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed font-light">
                              {item.description}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.015 }}
                              id={`prod-dialog-btn-${item.id}`}
                              className="w-full mt-4 text-center bg-[#FCFBF9] hover:bg-[#F0F4EF] border border-[#eeeae1] py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold text-[#244D33] transition-colors cursor-pointer"
                            >
                              Уточнить наличие
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 bg-[#FCFBF9] rounded-3xl text-center border border-dashed border-[#eeeae1] max-w-sm mx-auto p-4">
                      <p className="text-xs text-stone-500 font-light">Товары еще не добавлены в данный профиль.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "delivery" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl text-stone-600 font-light text-sm sm:text-base leading-relaxed flex flex-col gap-4"
                >
                  <h3 className="text-xl font-serif font-bold text-[#244D33] mb-2">Условия доставки и взаиморасчетов</h3>
                  <p>
                    <strong>Региональный охват:</strong> Доставка по городу {project.city} осуществляется в течение дня силами курьера или самовывозом по согласованию.
                  </p>
                  <p>
                    <strong>Глобальная этно-логистика:</strong> Для жителей Москвы, Краснодара, Стамбула и других крупных городов мира товары отправляются через транспортные компании СДЭК, Boxberry или Почту России. Для сыра предусмотрена герметичная вакуумная изоляция.
                  </p>
                  <p>
                    <strong>Гарантия безопасности:</strong> Проект Сигуп является некоммерческой информационной палатой. Вы рассчитываетесь с мастером напрямую без каких-либо комиссий.
                  </p>
                </motion.div>
              )}

              {activeTab === "contacts" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl text-sm sm:text-base leading-relaxed"
                >
                  <h3 className="text-xl font-serif font-bold text-[#244D33] mb-4">Способы связи</h3>
                  <ul className="flex flex-col gap-4 text-stone-600 font-light">
                    <li className="flex items-center gap-3">
                      <UserLabel className="w-5 h-5 text-[#c79e61]" />
                      <span><strong>Представитель фирмы:</strong> {project.authorName}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#c79e61]" />
                      <span><strong>Контактный номер:</strong> {project.phone || "Не указан"}</span>
                    </li>
                    {project.instagram && (
                      <li className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-[#c79e61]" />
                        <span><strong>Профиль Instagram:</strong> @{project.instagram.replace("@", "")}</span>
                      </li>
                    )}
                    {project.telegram && (
                      <li className="flex items-center gap-3">
                        <Send className="w-5 h-5 text-[#c79e61] rotate-[-25deg]" />
                        <span><strong>Канал Telegram:</strong> @{project.telegram}</span>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Similar Projects Carousel */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#244D33]">Схожие кавказские марки</h2>
            <button
              onClick={onBack}
              className="text-xs font-bold text-[#c79e61] hover:text-[#244D33] flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Вся витрина</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProjects.map((p) => (
              <motion.div
                whileHover={{ y: -3 }}
                key={p.id}
                id={`similar-project-card-${p.id}`}
                onClick={() => onSelectProject(p.id)}
                className="bg-white rounded-[24px] overflow-hidden border border-[#eeeae1] p-4 shadow-sm hover:border-[#c79e61]/35 transition-all duration-500 group cursor-pointer flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F0F4EF]">
                  <img src={p.photos ? p.photos[0] : ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="truncate flex-grow">
                  <h3 className="text-sm font-serif font-bold text-[#244D33] group-hover:text-[#c79e61] transition-colors truncate">
                    {p.name}
                  </h3>
                  <span className="text-[8px] bg-[#244D33]/5 text-[#244D33] font-bold py-0.5 px-2 rounded-full uppercase mt-1 inline-block tracking-widest font-mono">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-[#c79e61]" />
                    <span className="truncate">{p.city}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Static Prompt Box */}
        <section className="bg-white rounded-[32px] border border-[#eeeae1]/85 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-[#244D33]/5 select-none opacity-30 transform translate-x-12 translate-y-[-10px] pointer-events-none">
            <img src="/input_file_0.png" alt="" className="w-44 h-44 opacity-2" />
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F4EF] flex items-center justify-center text-[#244D33] shrink-0">
              <HelpCircle className="w-5 h-5 text-[#244D33]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#244D33]">Представляете адыгское дело или бренд?</h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed font-light">
                Вы можете бесплатно разместить свое дело в нашей информационной витрине, чтобы о вас заговорили по всему миру.
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAddCardModal}
            id="details-bottom-cta-btn"
            className="w-full md:w-auto px-7 py-4 bg-[#244D33] hover:bg-[#3E6F4D] text-white font-semibold rounded-full text-xs uppercase tracking-widest cursor-pointer shadow-md"
          >
            Добавить свой проект
          </motion.button>
        </section>
      </div>
    </motion.div>
  );
}

function UserLabel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

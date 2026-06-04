import { useParams, Link } from 'react-router-dom';
import { projects } from '../lib/mockData';
import { MapPin, Phone, Instagram, CheckCircle2, MessageCircle, Send, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const project = projects.find(p => p.id === id) || projects[0];

  return (
    <div className="bg-brand-sand-50 pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-brand-gray">
         <Link to="/" className="hover:text-brand-green-800 transition">Главная</Link>
         <span className="mx-2">/</span>
         <Link to="/catalog" className="hover:text-brand-green-800 transition">Каталог</Link>
         <span className="mx-2">/</span>
         <Link to="/catalog" className="hover:text-brand-green-800 transition">{project.category}</Link>
         <span className="mx-2">/</span>
         <span className="text-brand-dark">{project.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Images */}
          <div className="lg:col-span-2 space-y-4">
             <div className="relative aspect-[4/3] bg-brand-sand-200 rounded overflow-hidden">
               <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">
                 1 / {project.images?.length || 1}
               </div>
               <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition text-brand-dark shadow-sm">
                 <ChevronLeft size={20} />
               </button>
               <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition text-brand-dark shadow-sm">
                 <ChevronRight size={20} />
               </button>
             </div>
             
             {project.images && (
               <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                 {project.images.map((img, i) => (
                   <div key={i} className={`w-24 h-24 rounded overflow-hidden shrink-0 cursor-pointer ${i === 0 ? 'ring-2 ring-brand-green-800 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}>
                     <img src={img} alt="" className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Right Column: Key Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-medium mb-3">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-brand-sand-200 text-sm rounded">{project.category}</span>
                <div className="flex items-center text-brand-gray text-sm">
                  <MapPin size={16} className="mr-1" />
                  {project.location}
                </div>
              </div>
              {project.verified && (
                <div className="flex items-center text-sm font-medium text-brand-green-800 bg-brand-green-800/10 px-3 py-1.5 rounded w-fit">
                  <CheckCircle2 size={16} className="mr-2" />
                  Проверенный проект
                </div>
              )}
            </div>

            <p className="text-brand-gray text-base leading-relaxed">
              {project.description}
            </p>

            <button className="w-full py-4 bg-brand-green-800 text-white rounded font-medium hover:bg-brand-green-700 transition flex items-center justify-center shadow">
               Связаться <MessageCircle size={18} className="ml-2" />
            </button>

            <div className="grid grid-cols-4 gap-2">
              <button className="flex flex-col items-center justify-center gap-2 py-3 bg-white border border-brand-sand-200 rounded hover:bg-brand-sand-50 transition text-brand-dark">
                <Instagram size={20} />
                <span className="text-[10px] uppercase font-medium">Instagram</span>
              </button>
               <button className="flex flex-col items-center justify-center gap-2 py-3 bg-white border border-brand-sand-200 rounded hover:bg-brand-sand-50 transition text-brand-dark">
                <MessageCircle size={20} />
                 <span className="text-[10px] uppercase font-medium">WhatsApp</span>
              </button>
               <button className="flex flex-col items-center justify-center gap-2 py-3 bg-white border border-brand-sand-200 rounded hover:bg-brand-sand-50 transition text-brand-dark">
                <Send size={20} />
                 <span className="text-[10px] uppercase font-medium">Telegram</span>
              </button>
               <button className="flex flex-col items-center justify-center gap-2 py-3 bg-white border border-brand-sand-200 rounded hover:bg-brand-sand-50 transition text-brand-dark">
                <Phone size={20} />
                 <span className="text-[10px] uppercase font-medium">Позвонить</span>
              </button>
            </div>

            <div className="bg-white border border-brand-sand-200 rounded p-5 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 flex-shrink-0 text-brand-gray">₽</div>
                <div>
                  <h4 className="font-medium text-sm">Цены уточняйте у продавца</h4>
                  <p className="text-xs text-brand-gray">Актуальные цены и наличие уточняйте в сообщениях или по телефону.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 flex-shrink-0 text-brand-gray">🚚</div>
                <div>
                  <h4 className="font-medium text-sm">Доставка доступна</h4>
                  <p className="text-xs text-brand-gray">Доставляем по Майкопу и Адыгее. В другие регионы — по договоренности.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-12">
             <section>
               <h3 className="text-2xl font-serif font-medium mb-6 border-b border-brand-sand-200 pb-4">О проекте</h3>
               <div className="prose prose-sm max-w-none text-brand-gray">
                 <p className="mb-4">
                  Сырная мастерская «Уэдыж» — это семейное дело, где бережно хранят традиции сыроделия Адыгеи. Мы производим натуральные сыры из свежего коровьего молока, без консервантов и растительных жиров.
                 </p>
                 <p>
                  Наши сыры созревают естественным образом, сохраняя насыщенный вкус, нежную текстуру и пользу настоящего продукта. Мы уверены, что простые и честные продукты делают жизнь вкуснее и здоровее.
                 </p>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                 <div className="bg-white border border-brand-sand-200 p-4 rounded text-center">
                    <div className="text-2xl mb-2">🌿</div>
                    <div className="text-xs font-medium text-brand-gray">Натуральные ингредиенты</div>
                 </div>
                 <div className="bg-white border border-brand-sand-200 p-4 rounded text-center">
                    <div className="text-2xl mb-2">📖</div>
                    <div className="text-xs font-medium text-brand-gray">Традиционные рецепты</div>
                 </div>
                 <div className="bg-white border border-brand-sand-200 p-4 rounded text-center">
                    <div className="text-2xl mb-2">🤲</div>
                    <div className="text-xs font-medium text-brand-gray">Ручная работа и контроль качества</div>
                 </div>
                 <div className="bg-white border border-brand-sand-200 p-4 rounded text-center">
                    <div className="text-2xl mb-2">🚫</div>
                    <div className="text-xs font-medium text-brand-gray">Без консервантов и добавок</div>
                 </div>
               </div>
             </section>
             
             {/* Map Placeholder */}
             <section>
                 <h3 className="text-xl font-medium mb-4">Адрес и карта</h3>
                 <div className="bg-white p-6 rounded border border-brand-sand-200 hover:shadow-sm transition">
                    <div className="flex items-start gap-4 mb-4">
                      <MapPin className="text-brand-gray mt-1" />
                      <div>
                        <div className="font-medium">Республика Адыгея, г. Майкоп</div>
                        <div className="text-sm text-brand-gray">ул. Шовгенова, 35</div>
                      </div>
                    </div>
                    <div className="w-full h-64 bg-brand-sand-200 rounded flex items-center justify-center text-brand-gray relative overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Map View" className="w-full h-full object-cover blur-sm opacity-50" />
                       <div className="absolute flex flex-col items-center">
                          <MapPin size={32} className="text-brand-green-800 drop-shadow-md" />
                          <span className="font-medium text-sm mt-2 text-brand-dark bg-white/80 px-2 py-1 rounded">Майкоп</span>
                       </div>
                    </div>
                 </div>
             </section>
           </div>
           
           <div className="lg:col-span-1">
             {/* Sidebar Widgets */}
             <div className="sticky top-24">
                <div className="bg-white rounded border border-brand-sand-200 p-6 space-y-6">
                  <h3 className="font-medium text-lg border-b border-brand-sand-100 pb-3">Связаться с продавцом</h3>
                  
                  <div className="space-y-4">
                    <a href="#" className="flex items-center text-sm text-brand-gray hover:text-brand-green-800 transition">
                      <Phone size={18} className="mr-3" />
                      +7 (928) 123-45-67
                    </a>
                    <a href="#" className="flex items-center text-sm text-brand-gray hover:text-brand-green-800 transition">
                      <Instagram size={18} className="mr-3" />
                      @uedyzh_cheese
                    </a>
                    <a href="#" className="flex items-center text-sm text-brand-gray hover:text-brand-green-800 transition">
                      <MessageCircle size={18} className="mr-3" />
                      Написать в WhatsApp
                    </a>
                     <a href="#" className="flex items-center text-sm text-brand-gray hover:text-brand-green-800 transition">
                      <Send size={18} className="mr-3" />
                      Написать в Telegram
                    </a>
                    <a href="#" className="flex items-center text-sm text-brand-gray hover:text-brand-green-800 transition">
                      <Globe size={18} className="mr-3" />
                      uedyzh-cheese.ru
                    </a>
                  </div>

                  <button className="w-full py-3 bg-brand-green-800/10 text-brand-green-800 rounded text-sm font-medium hover:bg-brand-green-800 hover:text-white transition flex items-center justify-center">
                    Написать сообщение <MessageCircle size={14} className="ml-2" />
                  </button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

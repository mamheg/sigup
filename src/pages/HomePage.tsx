import { motion } from 'framer-motion';
import { Search, MapPin, Heart, MoveRight, ArrowRight } from 'lucide-react';
import { categories, projects, events } from '../lib/mockData';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium leading-tight mb-6"
          >
            SiGup — информационная площадка о черкесских товарах и услугах
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-brand-gray mb-10 max-w-2xl"
          >
            Находите предпринимателей, товары, услуги и события черкесского сообщества по всему миру.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link to="/catalog" className="inline-flex items-center justify-center px-6 py-3 bg-brand-green-800 text-white rounded hover:bg-brand-green-700 transition">
              Перейти в каталог <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link to="/cabinet" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-brand-sand-200 text-brand-dark rounded hover:bg-brand-sand-100 transition">
              Разместить свой проект
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-brand-gray" />
            </div>
            <input
              type="text"
              placeholder="Что вы ищете? Например: сыр, одежда, мастерская..."
              className="block w-full pl-12 pr-4 py-4 bg-white border-none rounded shadow-sm focus:ring-2 focus:ring-brand-green-800 outline-none text-base"
            />
          </motion.div>
        </div>
        
        {/* Placeholder for tower image from mockup, using generic styling for now */}
        <div className="absolute right-0 top-10 -z-10 w-2/5 h-[500px] bg-brand-sand-200 rounded-l-3xl overflow-hidden opacity-50 hidden lg:block">
           <img src="https://images.unsplash.com/photo-1543165365-0723aed7ca3d?auto=format&fit=crop&q=80" alt="Mountain landscape" className="w-full h-full object-cover mix-blend-multiply" />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-white border-y border-brand-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={category.id} 
                className="flex flex-col items-center justify-center p-6 bg-brand-sand-50 rounded cursor-pointer hover:bg-brand-sand-100 transition hover:shadow-sm"
              >
                <div className="w-12 h-12 mb-3 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-green-800">
                  {/* We would render Lucide icon here dynamically based on name, for now using a generic icon */}
                  <span className="font-semibold text-lg">{category.name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Projects */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-serif font-medium">Популярные проекты каталога</h2>
          <Link to="/catalog" className="text-sm font-medium text-brand-gray hover:text-brand-green-800 transition flex items-center">
            Смотреть все <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.slice(0, 4).map((project, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={project.id} 
              className="group bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition border border-brand-sand-200"
            >
              <Link to={`/project/${project.id}`}>
                <div className="relative h-48 overflow-hidden bg-brand-sand-100">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-brand-gray hover:text-red-500 transition">
                    <Heart size={18} />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-brand-green-800 transition line-clamp-1">{project.title}</h3>
                  <div className="inline-block px-2 py-1 bg-brand-sand-100 text-xs text-brand-gray rounded mb-3">
                    {project.category}
                  </div>
                  <p className="text-sm text-brand-gray line-clamp-2 mb-4 h-10">
                    {project.description}
                  </p>
                  <div className="flex items-center text-xs text-brand-gray">
                    <MapPin size={14} className="mr-1" />
                    {project.location}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Afisha */}
      <section className="py-20 bg-brand-sand-100 border-y border-brand-sand-200">
         <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-serif font-medium">Афиша</h2>
            <div className="flex items-center gap-4">
               <Link to="#" className="text-sm font-medium text-brand-gray hover:text-brand-green-800 transition">
                Смотреть все
              </Link>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
             {events.map((event, idx) => (
               <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={event.id}
                  className="min-w-[280px] sm:min-w-[320px] bg-white rounded overflow-hidden shadow-sm border border-brand-sand-200 flex-shrink-0"
               >
                  <div className="h-40 relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 className="absolute bottom-4 left-4 right-4 font-serif text-white font-medium text-lg leading-tight uppercase tracking-widest text-center">{event.title}</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 text-brand-gray">
                        <span className="w-4 h-4 rounded-full border border-brand-gray flex items-center justify-center text-[8px]">📅</span>
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-brand-gray">
                        <MapPin size={16} />
                        {event.location}
                      </div>
                    </div>
                    <Link to="#" className="mt-4 inline-flex items-center text-sm font-medium text-brand-green-800 hover:text-brand-green-600 transition">
                      Подробнее <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
               </motion.div>
             ))}
          </div>
         </div>
      </section>
      
      {/* Business CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-lg border border-brand-sand-200 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="mb-8 md:mb-0 md:mr-8 max-w-xl">
             <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">Вы предприниматель?</h2>
             <p className="text-brand-gray">Разместите свой проект на SiGup и расскажите о себе сообществу по всему миру. Привлекайте новых клиентов и станьте частью черкесского сообщества.</p>
          </div>
          <Link to="/cabinet" className="whitespace-nowrap px-8 py-4 bg-brand-green-800 text-white rounded font-medium hover:bg-brand-green-700 transition">
            Разместить свой проект
          </Link>
        </div>
      </section>

    </div>
  );
}

function ChevronRight({ className, ...props }: any) {
  return <MoveRight className={className} {...props} />
}

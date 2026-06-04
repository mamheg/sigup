import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  return (
    <div className="flex bg-brand-sand-50 min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-sand-200 hidden md:block border-t-0">
        <nav className="p-4 space-y-2 mt-4">
          <a href="#" className="block px-4 py-2 bg-brand-sand-100 text-brand-green-800 rounded font-medium text-sm">Дашборд</a>
          <a href="#" className="block px-4 py-2 text-brand-gray hover:bg-brand-sand-50 rounded text-sm transition">Пользователи</a>
          <a href="#" className="block px-4 py-2 text-brand-gray hover:bg-brand-sand-50 rounded text-sm transition">Карточки каталога</a>
          <div className="flex justify-between items-center pr-2">
            <a href="#" className="flex-grow px-4 py-2 text-brand-gray hover:bg-brand-sand-50 rounded text-sm transition">На модерации</a>
             <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">12</span>
          </div>
          <a href="#" className="block px-4 py-2 text-brand-gray hover:bg-brand-sand-50 rounded text-sm transition">Афиша</a>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-serif font-medium mb-2">Дашборд администратора</h1>
            <p className="text-brand-gray">Обзор ключевых показателей и активности на платформе</p>
          </div>
          <div>
             <select className="bg-white border border-brand-sand-200 rounded px-4 py-2 text-sm outline-none">
               <option>Последние 30 дней</option>
             </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'На проверке', count: 12, delta: 'Смотреть очередь' },
            { label: 'Опубликовано', count: 1248, delta: '+36 за неделю' },
            { label: 'Предприниматели', count: 892, delta: '+18 за неделю' },
            { label: 'Мероприятия', count: 74, delta: '+6 за неделю' },
          ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded border border-brand-sand-200 shadow-sm">
                <div className="text-sm font-medium text-brand-gray mb-4">{stat.label}</div>
                <div className="text-4xl font-light text-brand-dark mb-4">{stat.count}</div>
                <div className="text-xs text-brand-gray">{stat.delta}</div>
             </div>
          ))}
        </div>

        <div className="bg-white border border-brand-sand-200 rounded p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Очередь на модерацию (12)</h2>
          </div>
          <div className="text-center text-brand-gray py-12 bg-brand-sand-50 rounded border border-dashed border-brand-sand-200">
             Таблица модерации (В разработке)
          </div>
        </div>
      </main>
    </div>
  );
}

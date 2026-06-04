import { motion } from 'framer-motion';

export default function CabinetPage() {
  return (
    <div className="flex bg-brand-sand-50 min-h-[calc(100vh-64px)]">
      {/* Sidebar - generic for now, we will use a separate layout component ideally but for this PoC it's fine */}
      <aside className="w-64 bg-white border-r border-brand-sand-200 hidden md:block">
        <div className="p-6 border-b border-brand-sand-200">
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-brand-sand-200 rounded-full mb-3"></div>
             <div className="font-medium">Аскер Хакунов</div>
             <div className="text-xs text-brand-gray mt-1">ИП Хакунов А. Р.</div>
           </div>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="block px-4 py-2 bg-brand-sand-100 text-brand-green-800 rounded font-medium text-sm">Обзор</a>
          <a href="#" className="block px-4 py-2 text-brand-gray hover:bg-brand-sand-50 rounded text-sm transition">Мои карточки</a>
          <a href="#" className="block px-4 py-2 text-brand-gray hover:bg-brand-sand-50 rounded text-sm transition">Создать карточку</a>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-serif font-medium mb-2">Личный кабинет</h1>
        <p className="text-brand-gray mb-8">Здравствуйте, Аскер Хакунов. Здесь вы можете управлять своими проектами.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Stat cards */}
          {[
            { label: 'Всего карточек', count: 18, color: 'text-brand-dark' },
            { label: 'Опубликовано', count: 12, color: 'text-green-600' },
            { label: 'На проверке', count: 2, color: 'text-yellow-600' },
            { label: 'Требуют доработки', count: 1, color: 'text-red-600' },
          ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded border border-brand-sand-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-medium text-brand-gray mb-2">{stat.label}</div>
                <div className={`text-4xl font-light ${stat.color}`}>{stat.count}</div>
             </div>
          ))}
        </div>

        <div className="bg-white border border-brand-sand-200 rounded p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Мои карточки</h2>
            <button className="px-4 py-2 bg-brand-green-800 text-white rounded text-sm hover:bg-brand-green-700 transition">
              Создать новую карточку
            </button>
          </div>
          <div className="text-center text-brand-gray py-8">
             Список карточек (В разработке)
          </div>
        </div>
      </main>
    </div>
  );
}

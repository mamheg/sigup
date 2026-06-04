import { Outlet, Link } from 'react-router-dom';
import { Search, Menu, User, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-dark bg-brand-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-sand-50/80 backdrop-blur-md border-b border-brand-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {/* Logo placeholder */}
            <div className="w-8 h-8 rounded-full border-2 border-brand-green-800 flex items-center justify-center">
              <span className="text-brand-green-800 font-serif font-bold text-lg">S</span>
            </div>
            <span className="font-serif font-semibold text-xl tracking-wide">SiGup</span>
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link to="/catalog" className="hover:text-brand-green-800 transition-colors">Каталог</Link>
            <Link to="#" className="hover:text-brand-green-800 transition-colors">Афиша</Link>
            <Link to="#" className="hover:text-brand-green-800 transition-colors">Объявления</Link>
            <Link to="#" className="hover:text-brand-green-800 transition-colors">Для предпринимателей</Link>
            <Link to="#" className="hover:text-brand-green-800 transition-colors">О проекте</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/cabinet" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-brand-green-800 transition">
              <User size={18} />
              <span>Войти</span>
            </Link>
            <Link to="/cabinet" className="hidden sm:flex px-4 py-2 bg-brand-green-800 text-white text-sm font-medium rounded hover:bg-brand-green-700 transition shadow-sm">
              Разместить проект
            </Link>
            <button className="md:hidden p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-sand-100 mt-20 py-12 border-t border-brand-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full border border-brand-green-800 flex items-center justify-center">
                <span className="text-brand-green-800 font-serif font-bold text-sm">S</span>
              </div>
              <span className="font-serif font-semibold text-lg tracking-wide">SiGup</span>
            </div>
            <p className="text-sm text-brand-gray mb-6">
              Информационная площадка о черкесских товарах, услугах, предпринимателях и событиях по всему миру.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li><Link to="/catalog">Каталог</Link></li>
              <li><Link to="#">Афиша</Link></li>
              <li><Link to="#">Объявления</Link></li>
              <li><Link to="/cabinet">Для предпринимателей</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Помощь</h4>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li><Link to="#">Правила размещения</Link></li>
              <li><Link to="#">Политика конфиденциальности</Link></li>
              <li><Link to="#">Связаться с нами</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Контакты</h4>
             <ul className="space-y-2 text-sm text-brand-gray">
              <li>info@sigup.ru</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-brand-sand-200 text-sm text-brand-gray text-center">
          © 2026 SiGup. Все права защищены.
        </div>
      </footer>
    </div>
  );
}

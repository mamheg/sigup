import { useEffect, useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, LayoutGrid, Inbox, CalendarRange, FolderTree,
  Settings, ExternalLink, Bell, LogOut,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { paths } from "../../lib/paths";
import { Avatar } from "../ui";

/**
 * Admin shell per mockup M3: собственный topbar + сайдбар, без публичного
 * Header/Footer. Страницы разделов рендерятся в <Outlet/>.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    api.admin
      .stats()
      .then((s) => alive && setPendingCount(s.pending_cards))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const nav = [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Дашборд" },
    { to: "/admin/moderation", icon: Inbox, label: "На модерации", badge: pendingCount ?? undefined },
    { to: "/admin/cards", icon: LayoutGrid, label: "Карточки каталога" },
    { to: "/admin/users", icon: Users, label: "Пользователи" },
    { to: "/admin/events", icon: CalendarRange, label: "Афиша" },
    { to: "/admin/categories", icon: FolderTree, label: "Категории" },
    { to: "/admin/settings", icon: Settings, label: "Настройки сайта" },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-40 bg-surface border-b border-line">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src="/sigup-logo.png" alt="" width={32} height={32} className="object-contain" />
            <span className="font-serif text-xl font-bold text-brand tracking-wide">SiGup</span>
            <span className="hidden sm:inline text-xs text-ink-faint border-l border-line pl-2.5 ml-1">админ-панель</span>
          </Link>
          <div className="flex items-center gap-3">
            <button aria-label="Уведомления" className="w-9 h-9 rounded-sm border border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-canvas transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-sm font-medium text-ink">Администратор</div>
              <div className="text-xs text-ink-faint">{user?.email}</div>
            </div>
            <Avatar
              name={user?.name ?? "A"}
              src={user?.avatar_url}
              className="w-9 h-9 bg-brand text-brand-fg text-sm font-semibold uppercase"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-surface">
          <nav className="flex-1 p-3 flex flex-col gap-1">
            {nav.map(({ to, end, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  "flex items-center gap-2.5 px-3 h-10 rounded-sm text-sm font-medium transition-colors " +
                  (isActive ? "bg-brand-muted text-brand" : "text-ink-soft hover:text-ink hover:bg-canvas")
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="min-w-6 h-6 px-1.5 rounded-full bg-brand text-brand-fg text-xs font-semibold flex items-center justify-center tabular">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-line flex flex-col gap-1">
            <Link
              to={paths.home}
              className="flex items-center gap-2.5 px-3 h-10 rounded-sm text-sm font-medium text-ink-soft hover:text-ink hover:bg-canvas transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Перейти на сайт
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2.5 px-3 h-10 rounded-sm text-sm font-medium text-ink-soft hover:text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

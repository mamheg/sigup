/**
 * Пользователи платформы: имя, контакты, роль, число карточек, дата регистрации.
 */
import { useCallback, useEffect, useState } from "react";
import { api, ApiUser } from "../../lib/api";
import { Badge, Card } from "../../components/ui";
import { EmptyState, ErrorState, fmtDate, PageHeader, TableSkeleton } from "./shared";

type AdminUser = ApiUser & { cards_count: number };

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoadError(null);
    setUsers(null);
    api.admin
      .users()
      .then(setUsers)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Не удалось загрузить пользователей"));
  }, []);

  useEffect(load, [load]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <title>Пользователи — админ-панель SiGup</title>
      <PageHeader title="Пользователи" subtitle="Зарегистрированные предприниматели и администраторы" />

      <Card className="p-5 sm:p-6">
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : users === null ? (
          <TableSkeleton rows={7} />
        ) : users.length === 0 ? (
          <EmptyState text="Пользователей пока нет." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
                  <th className="pb-3 pr-4 font-semibold">Имя</th>
                  <th className="pb-3 pr-4 font-semibold">Email</th>
                  <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Телефон</th>
                  <th className="pb-3 pr-4 font-semibold">Роль</th>
                  <th className="pb-3 pr-4 font-semibold text-right">Карточек</th>
                  <th className="pb-3 font-semibold hidden lg:table-cell">Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-brand-muted text-brand flex items-center justify-center text-sm font-semibold uppercase shrink-0">
                          {u.name.trim().slice(0, 1) || "?"}
                        </span>
                        <span className="font-medium text-ink truncate max-w-[180px] block">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-ink-soft break-all">{u.email}</td>
                    <td className="py-3.5 pr-4 text-ink-soft tabular hidden md:table-cell whitespace-nowrap">
                      {u.phone || "—"}
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge tone={u.role === "admin" ? "brand" : "neutral"}>
                        {u.role === "admin" ? "Администратор" : "Предприниматель"}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-ink tabular text-right">{u.cards_count}</td>
                    <td className="py-3.5 text-ink-faint tabular hidden lg:table-cell whitespace-nowrap">
                      {fmtDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

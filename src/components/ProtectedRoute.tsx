import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { paths } from "../lib/paths";

/**
 * UX-гейт маршрутов (настоящая граница доступа — на сервере).
 * Гость → /login; недостаточная роль → главная.
 */
export default function ProtectedRoute({ admin, children }: { admin?: boolean; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-faint">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to={paths.login} state={{ from: location.pathname }} replace />;
  if (admin && user.role !== "admin") return <Navigate to={paths.home} replace />;
  return <>{children}</>;
}

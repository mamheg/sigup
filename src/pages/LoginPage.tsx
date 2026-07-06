import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button, Input } from "../components/ui";
import { paths } from "../lib/paths";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = useMemo(() => emailValid && password.length >= 6, [emailValid, password]);

  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email.trim(), password);
      navigate(from ?? (user.role === "admin" ? paths.admin : paths.cabinet), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <title>Вход — SiGup</title>
      <meta name="description" content="Вход в личный кабинет SiGup — платформы черкесских товаров, услуг и предпринимателей." />

      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link to={paths.home} className="inline-block font-serif text-3xl text-brand tracking-tight">
            SiGup
          </Link>
          <p className="mt-1 text-sm text-ink-faint">Северный Кавказ</p>
        </div>

        <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
          <h1 className="font-serif text-2xl text-ink tracking-tight text-balance">С возвращением</h1>
          <p className="mt-1 text-sm text-ink-soft">Войдите, чтобы управлять своими проектами.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              label="Электронная почта"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              required
            />
            <Input
              label="Пароль"
              type="password"
              autoComplete="current-password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              required
            />

            <div className="flex justify-end -mt-2">
              <Link to={paths.reset} className="text-xs font-medium text-brand hover:text-gold-dark transition-colors">
                Забыли пароль?
              </Link>
            </div>

            {error && (
              <div className="flex gap-2.5 rounded-sm bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={!canSubmit || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Входим…
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={() => navigate(paths.register)}
              className="font-medium text-brand hover:text-gold-dark transition-colors cursor-pointer"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

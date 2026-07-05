import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, Loader2 } from "lucide-react";
import { Button, Input } from "../components/ui";
import { paths } from "../lib/paths";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = useMemo(() => emailValid && password.length >= 6, [emailValid, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    // Backend deferred — no API call. Simulate a brief pending state, then inform.
    setSubmitting(true);
    setNotice(false);
    window.setTimeout(() => {
      setSubmitting(false);
      setNotice(true);
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas flex items-center justify-center px-4 py-16">
      <title>Вход — SiGup</title>
      <meta name="description" content="Вход в личный кабинет SiGup — платформы черкесских товаров, услуг и предпринимателей." />

      <div className="w-full max-w-[440px]">
        {/* Brand */}
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
              onChange={(e) => {
                setEmail(e.target.value);
                setNotice(false);
              }}
              required
            />
            <Input
              label="Пароль"
              type="password"
              autoComplete="current-password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setNotice(false);
              }}
              required
            />

            {notice && (
              <div className="flex gap-2.5 rounded-sm bg-brand-muted border border-line px-3.5 py-3 text-sm text-ink-soft">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                <span>Вход скоро заработает — бэкенд в разработке.</span>
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

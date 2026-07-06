import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, MailCheck, CheckCircle2 } from "lucide-react";
import { Button, Input } from "../components/ui";
import { paths } from "../lib/paths";
import { api, ApiError } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "confirm" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(email.trim()) || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await api.auth.resetSendCode(email.trim());
      setInfo(res.message);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось отправить код.");
    } finally { setBusy(false); }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4 || password.length < 6 || busy) return;
    setBusy(true); setError(null);
    try {
      await api.auth.resetConfirm(email.trim(), code.trim(), password);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сменить пароль.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <title>Восстановление пароля — SiGup</title>
      <meta name="robots" content="noindex" />

      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link to={paths.home} className="inline-block font-serif text-3xl text-brand tracking-tight">SiGup</Link>
          <p className="mt-1 text-sm text-ink-faint">Северный Кавказ</p>
        </div>

        <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
          <h1 className="font-serif text-2xl text-ink tracking-tight">Восстановление пароля</h1>

          {step === "email" && (
            <form onSubmit={sendCode} noValidate className="mt-6 flex flex-col gap-4">
              <p className="text-sm text-ink-soft -mt-3">Укажите почту аккаунта — отправим код для смены пароля.</p>
              <Input
                label="Электронная почта"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                required
              />
              {error && <ErrorBox text={error} />}
              <Button type="submit" fullWidth size="lg" disabled={!EMAIL_RE.test(email.trim()) || busy}>
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Отправляем…</> : "Получить код"}
              </Button>
            </form>
          )}

          {step === "confirm" && (
            <form onSubmit={confirm} noValidate className="mt-6 flex flex-col gap-4">
              {info && (
                <div className="flex gap-2.5 rounded-sm bg-brand-muted border border-line px-3.5 py-3 text-sm text-ink-soft">
                  <MailCheck className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                  <span>{info}</span>
                </div>
              )}
              <Input
                label="Код из письма"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6 цифр"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(null); }}
                required
              />
              <Input
                label="Новый пароль"
                type="password"
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                required
              />
              {error && <ErrorBox text={error} />}
              <Button type="submit" fullWidth size="lg" disabled={code.trim().length < 4 || password.length < 6 || busy}>
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохраняем…</> : "Сменить пароль"}
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="mt-6 flex flex-col items-center text-center gap-4 py-4">
              <CheckCircle2 className="w-10 h-10 text-brand" />
              <p className="text-ink-soft text-sm">Пароль изменён. Теперь войдите с новым паролем.</p>
              <Button size="lg" onClick={() => navigate(paths.login)}>Войти</Button>
            </div>
          )}

          {step !== "done" && (
            <p className="mt-6 text-center text-sm text-ink-soft">
              Вспомнили пароль?{" "}
              <Link to={paths.login} className="font-medium text-brand hover:text-gold-dark transition-colors">Войти</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5 rounded-sm bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}

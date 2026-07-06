import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { Button, Input } from "../components/ui";
import { paths } from "../lib/paths";
import { useAuth } from "../lib/auth";
import { api, ApiError } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "code" | "details";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof ApiError ? err.message : fallback);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(email.trim()) || busy) return;
    setBusy(true); setError(null); setInfo(null);
    try {
      const res = await api.auth.sendCode(email.trim());
      setInfo(res.message);
      setStep("code");
    } catch (err) {
      fail(err, "Не удалось отправить код. Попробуйте позже.");
    } finally { setBusy(false); }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4 || busy) return;
    setBusy(true); setError(null);
    try {
      await api.auth.verifyCode(email.trim(), code.trim());
      setInfo(null);
      setStep("details");
    } catch (err) {
      fail(err, "Неверный код.");
    } finally { setBusy(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || password.length < 6 || busy) return;
    setBusy(true); setError(null);
    try {
      await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
      navigate(paths.cabinet, { replace: true });
    } catch (err) {
      fail(err, "Не удалось зарегистрироваться.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <title>Регистрация — SiGup</title>
      <meta name="description" content="Регистрация предпринимателя на SiGup: разместите свой проект в каталоге черкесских товаров и услуг." />

      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link to={paths.home} className="inline-block font-serif text-3xl text-brand tracking-tight">SiGup</Link>
          <p className="mt-1 text-sm text-ink-faint">Северный Кавказ</p>
        </div>

        <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
          <h1 className="font-serif text-2xl text-ink tracking-tight text-balance">Создать аккаунт</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {step === "email" && "Укажите почту — отправим код подтверждения."}
            {step === "code" && "Введите код из письма."}
            {step === "details" && "Почта подтверждена. Осталось заполнить профиль."}
          </p>

          {/* Шаг 1 — email */}
          {step === "email" && (
            <form onSubmit={sendCode} noValidate className="mt-6 flex flex-col gap-4">
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
              {error && <ErrorBox text={error} />}
              <Button type="submit" fullWidth size="lg" disabled={!EMAIL_RE.test(email.trim()) || busy}>
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Отправляем…</> : "Получить код"}
              </Button>
            </form>
          )}

          {/* Шаг 2 — код */}
          {step === "code" && (
            <form onSubmit={verifyCode} noValidate className="mt-6 flex flex-col gap-4">
              {info && (
                <div className="flex gap-2.5 rounded-sm bg-brand-muted border border-line px-3.5 py-3 text-sm text-ink-soft">
                  <MailCheck className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                  <span>{info} <span className="text-ink-faint">({email.trim()})</span></span>
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
              {error && <ErrorBox text={error} />}
              <Button type="submit" fullWidth size="lg" disabled={code.trim().length < 4 || busy}>
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Проверяем…</> : "Подтвердить"}
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); }} className="inline-flex items-center gap-1 text-ink-soft hover:text-ink transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Изменить почту
                </button>
                <button type="button" onClick={() => sendCode()} disabled={busy} className="font-medium text-brand hover:text-gold-dark transition-colors">
                  Отправить код ещё раз
                </button>
              </div>
            </form>
          )}

          {/* Шаг 3 — профиль */}
          {step === "details" && (
            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
              <Input
                label="Имя"
                autoComplete="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                required
              />
              <Input
                label="Телефон (необязательно)"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Пароль"
                type="password"
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                required
              />
              {error && <ErrorBox text={error} />}
              <Button type="submit" fullWidth size="lg" disabled={name.trim().length < 2 || password.length < 6 || busy}>
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Создаём…</> : "Зарегистрироваться"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-soft">
            Уже есть аккаунт?{" "}
            <button type="button" onClick={() => navigate(paths.login)} className="font-medium text-brand hover:text-gold-dark transition-colors cursor-pointer">
              Войти
            </button>
          </p>
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

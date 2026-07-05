import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, Loader2, Check } from "lucide-react";
import { Button, Input, Select } from "../components/ui";
import { paths } from "../lib/paths";
import { ProjectCategory } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEntrepreneur, setIsEntrepreneur] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());

  const canSubmit = useMemo(() => {
    const baseValid = name.trim().length >= 2 && emailValid && password.length >= 6;
    if (!isEntrepreneur) return baseValid;
    return baseValid && businessName.trim().length >= 2 && category !== "" && phone.trim().length >= 6;
  }, [name, emailValid, password, isEntrepreneur, businessName, category, phone]);

  const clearNotice = () => setNotice(false);

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
      <title>Регистрация — SiGup</title>
      <meta
        name="description"
        content="Создайте аккаунт на SiGup — платформе черкесских товаров, услуг и предпринимателей."
      />

      <div className="w-full max-w-[440px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to={paths.home} className="inline-block font-serif text-3xl text-brand tracking-tight">
            SiGup
          </Link>
          <p className="mt-1 text-sm text-ink-faint">Северный Кавказ</p>
        </div>

        <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
          <h1 className="font-serif text-2xl text-ink tracking-tight text-balance">Создать аккаунт</h1>
          <p className="mt-1 text-sm text-ink-soft">Присоединяйтесь к сообществу SiGup.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              label="Имя"
              type="text"
              autoComplete="name"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearNotice();
              }}
              required
            />
            <Input
              label="Электронная почта"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearNotice();
              }}
              required
            />
            <Input
              label="Пароль"
              type="password"
              autoComplete="new-password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearNotice();
              }}
              required
            />

            {/* Entrepreneur toggle */}
            <button
              type="button"
              onClick={() => {
                setIsEntrepreneur((v) => !v);
                clearNotice();
              }}
              className="flex items-center gap-3 rounded-sm border border-line bg-canvas px-3.5 py-3 text-left transition-colors hover:border-line-strong cursor-pointer"
              aria-pressed={isEntrepreneur}
            >
              <span
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors " +
                  (isEntrepreneur ? "bg-brand border-brand text-brand-fg" : "bg-surface border-line-strong")
                }
              >
                {isEntrepreneur && <Check className="h-3.5 w-3.5" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">Я предприниматель</span>
                <span className="block text-xs text-ink-faint">Разместите свой проект в каталоге</span>
              </span>
            </button>

            {/* Entrepreneur fields */}
            {isEntrepreneur && (
              <div className="flex flex-col gap-4 rounded-md border border-line bg-canvas p-4">
                <Input
                  label="Название бизнеса"
                  type="text"
                  placeholder="Например: Сыроварня «Нартух»"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    clearNotice();
                  }}
                  required
                />
                <Select
                  label="Категория"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as ProjectCategory | "");
                    clearNotice();
                  }}
                  required
                >
                  <option value="" disabled>
                    Выберите категорию
                  </option>
                  {Object.values(ProjectCategory).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Контактный телефон"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 900 000-00-00"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearNotice();
                  }}
                  required
                />
              </div>
            )}

            {notice && (
              <div className="flex gap-2.5 rounded-sm bg-brand-muted border border-line px-3.5 py-3 text-sm text-ink-soft">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                <span>Регистрация скоро заработает — бэкенд в разработке.</span>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={!canSubmit || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Регистрируем…
                </>
              ) : (
                "Зарегистрироваться"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={() => navigate(paths.login)}
              className="font-medium text-brand hover:text-gold-dark transition-colors cursor-pointer"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Menu, X, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../lib/auth";
import { paths } from "../lib/paths";
import LanguagePicker from "./LanguagePicker";

// ───────── SiGup Logo ─────────────────────────
function SiGupLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/sigup-logo.png"
      alt="SiGup"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = "none";
      }}
    />
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const go = (to: string) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  const accountLabel = role === "admin" ? "Админ-панель" : user ? t("nav.myCabinet") : t("nav.login");
  const accountTarget = role === "admin" ? paths.admin : user ? paths.cabinet : paths.login;

  const navLinks = [
    { label: t("nav.catalog"), action: () => go(paths.catalog), key: "catalog" },
    { label: t("nav.afisha"), action: () => go(paths.afisha), key: "afisha" },
    { label: t("nav.forEntrepreneurs"), action: () => go(paths.cabinet), key: "entrepreneurs" },
    { label: t("nav.about"), action: () => go(paths.about), key: "about" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 bg-surface border-b border-line shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[68px] flex items-center gap-3 sm:gap-4">
          {/* Logo */}
          <button onClick={() => go(paths.home)} className="flex items-center gap-2.5 cursor-pointer shrink-0" id="logo-btn">
            <div className="w-9 h-9 flex items-center justify-center">
              <SiGupLogo size={36} />
            </div>
            <span className="hidden sm:inline text-[22px] font-serif font-bold text-brand tracking-wide leading-none">SiGup</span>
          </button>

          {/* Spacer — pushes nav & controls to the right now that search moved to the catalog page */}
          <div className="flex-1" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink shrink-0">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={link.action}
                id={`nav-${link.key}`}
                className="relative py-1 text-[13.5px] font-medium text-ink hover:text-brand transition-colors cursor-pointer whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguagePicker />
            <button
              onClick={() => go(accountTarget)}
              id="login-btn"
              className="flex items-center gap-1.5 h-10 px-4 rounded-sm text-[13px] font-medium text-ink border border-line hover:border-line-strong hover:bg-canvas transition-colors cursor-pointer"
            >
              {role === "admin" ? <LayoutDashboard className="w-4 h-4 text-gold" /> : <User className="w-4 h-4 text-gold" />}
              <span>{accountLabel}</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
            className="flex lg:hidden items-center justify-center w-10 h-10 rounded-sm border border-line text-brand shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-surface border-t border-line overflow-hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={link.action}
                  className="text-left py-3 px-4 rounded-sm text-[14px] font-medium text-ink hover:bg-canvas hover:text-brand transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-line mt-2 pt-3 flex flex-col gap-2">
                <button
                  onClick={() => go(accountTarget)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-sm border border-line text-ink font-medium cursor-pointer"
                >
                  <User className="w-4 h-4 text-gold" />
                  <span>{accountLabel}</span>
                </button>
                <LanguagePicker full />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

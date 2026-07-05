import React, { useState, useRef, useEffect } from "react";
import { AppRole } from "../types";
import { User, Plus, Menu, X, ChevronDown, Compass, CalendarRange, FileText, Briefcase, ShieldCheck, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface HeaderProps {
  currentRole: AppRole;
  onRoleChange: (role: AppRole) => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onOpenAddCardModal?: () => void;
}

// ───────── SiGup Logo SVG component ─────────────────────────
function SiGupLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/sigup-logo.png"
      alt="SiGup"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={(e) => {
        // fallback ornament if logo not found
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = "none";
        el.insertAdjacentHTML("afterend", `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none"><path d="M40 8 C40 8 58 16 62 30 C66 44 58 54 40 62 C22 54 14 44 18 30 C22 16 40 8 40 8Z" stroke="#C79E61" stroke-width="2" fill="rgba(199,158,97,0.12)"/><circle cx="40" cy="35" r="6" fill="#C79E61"/></svg>`);
      }}
    />
  );
}

export default function Header({
  currentRole,
  onRoleChange,
  currentSection,
  onSectionChange,
  onOpenAddCardModal
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigateToBlock = (blockId: string) => {
    onSectionChange("main");
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(blockId)?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const navLinks = [
    { label: t("nav.catalog"), action: () => navigateToBlock("catalog-section"), key: "catalog" },
    { label: t("nav.afisha"), action: () => navigateToBlock("afisha-section"), key: "afisha" },
    { label: t("nav.announcements"), action: () => navigateToBlock("announcements-section"), key: "announcements" },
    { label: t("nav.forEntrepreneurs"), action: () => { onRoleChange("entrepreneur"); onSectionChange("cabinet"); setMobileMenuOpen(false); }, key: "entrepreneurs" },
    { label: t("nav.about"), action: () => { onSectionChange("about"); setMobileMenuOpen(false); }, key: "about" },
  ];

  const roleOptions = [
    { role: "guest" as AppRole, label: t("simulator.guest"), icon: User, section: "main" },
    { role: "entrepreneur" as AppRole, label: t("simulator.partner"), icon: Briefcase, section: "cabinet" },
    { role: "admin" as AppRole, label: t("simulator.moderator"), icon: ShieldCheck, section: "admin_panel" },
  ];

  const currentRoleLabel = currentRole === "admin"
    ? t("simulator.moderator")
    : currentRole === "entrepreneur"
    ? t("nav.myCabinet")
    : t("nav.login");

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 bg-white border-b border-[#EEEAE1] shadow-[0_1px_4px_rgba(36,77,51,0.04)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[68px] flex items-center justify-between gap-6">

            {/* ── Logo ── */}
            <button
              onClick={() => { onSectionChange("main"); setMobileMenuOpen(false); }}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              id="logo-btn"
            >
              <div className="w-9 h-9 flex items-center justify-center">
                <SiGupLogo size={36} />
              </div>
              <span className="text-[22px] font-serif font-bold text-[#244D33] tracking-wide leading-none">
                SiGup
              </span>
            </button>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2A2622]">
              {navLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={link.action}
                  id={`nav-${link.key}`}
                  className="relative py-1 text-[13.5px] font-medium text-[#2A2622] hover:text-[#244D33] transition-colors duration-200 cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* ── Right Controls ── */}
            <div className="hidden md:flex items-center gap-3 shrink-0">

              {/* Language switcher */}
              <div className="flex items-center gap-0.5 bg-[#F5F2EC] rounded-full p-0.5 border border-[#EEEAE1]">
                {(["ru", "kbd", "en", "krc"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    title={lang === "ru" ? "Русский" : lang === "kbd" ? "Кабардинский" : lang === "krc" ? "Балкарский" : "English"}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      language === lang
                        ? "bg-[#244D33] text-white shadow-sm"
                        : "text-[#6B7280] hover:text-[#244D33]"
                    }`}
                  >
                    {lang === "krc" ? "БАЛК" : lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Login / Cabinet button with role dropdown */}
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => {
                    if (currentRole !== "guest") {
                      onSectionChange(currentRole === "admin" ? "admin_panel" : "cabinet");
                    } else {
                      setLoginDropdownOpen(!loginDropdownOpen);
                    }
                  }}
                  id="login-btn"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-[#2A2622] border border-[#EEEAE1] hover:border-[#C79E61]/40 hover:bg-[#F5F2EC] transition-all duration-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#C79E61]" />
                  <span>{currentRoleLabel}</span>
                  {currentRole === "guest" && (
                    <ChevronDown className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${loginDropdownOpen ? "rotate-180" : ""}`} />
                  )}
                </button>

                <AnimatePresence>
                  {loginDropdownOpen && currentRole === "guest" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EEEAE1] overflow-hidden z-50"
                    >
                      {/* Demo mode header */}
                      <div className="px-4 py-3 bg-[#F5F2EC] border-b border-[#EEEAE1]">
                        <p className="text-[10px] font-bold text-[#C79E61] uppercase tracking-widest">{t("simulator.title")}</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">{t("simulator.subtitle")}</p>
                      </div>
                      <div className="p-2">
                        {roleOptions.map(({ role, label, icon: Icon, section }) => (
                          <button
                            key={role}
                            onClick={() => {
                              onRoleChange(role);
                              onSectionChange(section);
                              setLoginDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer text-left ${
                              currentRole === role
                                ? "bg-[#244D33] text-white"
                                : "text-[#374151] hover:bg-[#F5F2EC]"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${currentRole === role ? "text-[#C79E61]" : "text-[#9CA3AF]"}`} />
                            <span>{label}</span>
                            {currentRole === role && (
                              <UserCheck className="w-3.5 h-3.5 text-[#C79E61] ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="px-4 py-2.5 border-t border-[#EEEAE1] bg-[#FAFAF8]">
                        <p className="text-[10px] text-[#9CA3AF]">💡 Это демо-режим для тестирования</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Post project button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (currentRole !== "entrepreneur") {
                    onRoleChange("entrepreneur");
                    onSectionChange("cabinet");
                    setTimeout(() => { if (onOpenAddCardModal) onOpenAddCardModal(); }, 150);
                  } else {
                    if (onOpenAddCardModal) onOpenAddCardModal();
                  }
                }}
                id="add-project-header-btn"
                className="flex items-center gap-1.5 bg-[#244D33] hover:bg-[#1e3f2a] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer shadow-sm"
              >
                <span>{t("nav.publish")}</span>
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl border border-[#EEEAE1] text-[#244D33]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-[#EEEAE1] overflow-hidden"
            >
              <div className="px-4 py-5 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.key}
                    onClick={link.action}
                    className="text-left py-3 px-4 rounded-xl text-[14px] font-medium text-[#2A2622] hover:bg-[#F5F2EC] hover:text-[#244D33] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}

                <div className="border-t border-[#EEEAE1] mt-2 pt-3 flex flex-col gap-2">
                  {/* Language switcher mobile */}
                  <div className="flex items-center gap-1 p-1 bg-[#F5F2EC] rounded-xl border border-[#EEEAE1]">
                    {(["ru", "kbd", "en", "krc"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          language === lang ? "bg-[#244D33] text-white" : "text-[#6B7280]"
                        }`}
                      >
                        {lang === "krc" ? "БАЛК" : lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Role switcher mobile */}
                  <div className="bg-[#F5F2EC] rounded-xl border border-[#EEEAE1] p-2">
                    <p className="text-[10px] font-bold text-[#C79E61] uppercase tracking-widest px-2 mb-1.5">{t("simulator.title")}</p>
                    {roleOptions.map(({ role, label, icon: Icon, section }) => (
                      <button
                        key={role}
                        onClick={() => { onRoleChange(role); onSectionChange(section); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer text-left transition-all ${
                          currentRole === role ? "bg-[#244D33] text-white" : "text-[#374151] hover:bg-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${currentRole === role ? "text-[#C79E61]" : "text-[#9CA3AF]"}`} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (currentRole !== "entrepreneur") {
                        onRoleChange("entrepreneur");
                        onSectionChange("cabinet");
                        setMobileMenuOpen(false);
                        setTimeout(() => { if (onOpenAddCardModal) onOpenAddCardModal(); }, 150);
                      } else {
                        if (onOpenAddCardModal) onOpenAddCardModal();
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full bg-[#244D33] text-white py-3.5 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t("nav.publish")}</span>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Floating Role Simulator Badge ── */}
      <RoleSimulatorBadge
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        onSectionChange={onSectionChange}
        t={t}
        roleOptions={roleOptions}
      />
    </>
  );
}

// ─── Floating simulator badge (bottom-right corner) ──────────
function RoleSimulatorBadge({ currentRole, onRoleChange, onSectionChange, t, roleOptions }: {
  currentRole: AppRole;
  onRoleChange: (r: AppRole) => void;
  onSectionChange: (s: string) => void;
  t: (k: string) => string;
  roleOptions: { role: AppRole; label: string; icon: React.ComponentType<{ className?: string }>; section: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleColors: Record<AppRole, string> = {
    guest: "#6B7280",
    entrepreneur: "#C79E61",
    admin: "#244D33"
  };

  const roleIcons: Record<AppRole, React.ReactNode> = {
    guest: <User className="w-4 h-4" />,
    entrepreneur: <Briefcase className="w-4 h-4" />,
    admin: <ShieldCheck className="w-4 h-4" />
  };

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EEEAE1] overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#244D33]">
              <p className="text-[10px] font-bold text-[#C79E61] uppercase tracking-widest">{t("simulator.title")}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{t("simulator.subtitle")}</p>
            </div>
            <div className="p-2">
              {roleOptions.map(({ role, label, icon: Icon, section }) => (
                <button
                  key={role}
                  onClick={() => { onRoleChange(role); onSectionChange(section); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer text-left transition-all ${
                    currentRole === role ? "bg-[#244D33] text-white" : "text-[#374151] hover:bg-[#F5F2EC]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${currentRole === role ? "text-[#C79E61]" : "text-[#9CA3AF]"}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="simulator-badge flex items-center gap-2.5 text-white"
        title="Симулятор ролей"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: roleColors[currentRole] }}
        >
          {roleIcons[currentRole]}
        </div>
        <div className="text-left">
          <div className="text-[9px] font-bold text-[#C79E61] uppercase tracking-widest leading-none">Роль</div>
          <div className="text-[11px] font-semibold leading-tight mt-0.5">
            {currentRole === "guest" ? t("simulator.guest") : currentRole === "entrepreneur" ? t("simulator.partner") : t("simulator.moderator")}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Youtube, Send } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { paths } from "../lib/paths";

/* ─── Inline VK icon (not available in lucide-react) ──────────────────────── */
function VkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 7.5h3c.5 2.5 1.2 4.8 2.5 6.2.4.4.8.6 1.2.3.3-.2.3-.8.2-2V7.5h2.8v5.2c0 1-.1 2-.6 2.6 1.2-.2 2.3-1.2 3.2-2.8.6-1 1-2.2 1.4-3.5l.5-1.5h3l-.3 1c-.5 1.5-1.2 3-2.2 4.3-1 1.3-2.2 2.4-3.6 3-.8.4-1.6.5-2.4.5H9c-1 0-1.8-.4-2.5-1.1C4.5 13.2 3.2 10.5 2 7.5z" />
    </svg>
  );
}

/* ─── Footer Logo (light theme) ───────────────────────────────────────────── */
function FooterLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/sigup-logo.png"
        alt="SiGup"
        width={40}
        height={40}
        className="object-contain"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.style.display = "none";
        }}
      />
      <span className="text-[22px] font-serif font-bold text-[#2A2622] leading-none tracking-wide">
        SiGup
      </span>
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navLinks = [
    { label: t("nav.catalog"), to: paths.catalog },
    { label: t("nav.afisha"), to: paths.afisha },
    { label: t("nav.forEntrepreneurs"), to: paths.cabinet, entrepreneur: true },
    { label: t("nav.about"), to: paths.about },
  ];

  const helpLinks = [
    t("footer.help.rules"),
    t("footer.help.privacy"),
    t("footer.help.terms"),
    t("footer.help.faq"),
    t("footer.help.contact"),
  ];

  const socialLinks = [
    {
      href: "https://t.me/sigup",
      id: "footer-telegram-link",
      label: "Telegram",
      icon: <Send className="w-4 h-4 text-[#6B7280]" />,
    },
    {
      href: "https://vk.com/sigup",
      id: "footer-vk-link",
      label: "VK",
      icon: <VkIcon className="w-4 h-4 text-[#6B7280]" />,
    },
    {
      href: "https://instagram.com",
      id: "footer-instagram-link",
      label: "Instagram",
      icon: <Instagram className="w-4 h-4 text-[#6B7280]" />,
    },
    {
      href: "https://youtube.com",
      id: "footer-youtube-link",
      label: "YouTube",
      icon: <Youtube className="w-4 h-4 text-[#6B7280]" />,
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-canvas border-t border-line">
      {/* Орнамент-водяной знак (M1–M4) */}
      <img
        src="/ornament.svg"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -right-8 bottom-4 w-64 opacity-[0.14] hidden sm:block"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-14">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 sm:gap-10">

          {/* Column 1: Brand */}
          <div className="col-span-2 lg:col-span-1">
            <FooterLogo />
            <p className="mt-3 sm:mt-4 text-[13px] text-[#6B7280] font-light leading-relaxed max-w-[240px] line-clamp-2 sm:line-clamp-none">
              {t("footer.desc")}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={social.id}
                  className="w-9 h-9 rounded-full bg-transparent hover:bg-[#F5F2EC] border border-[#EEEAE1] flex items-center justify-center transition-all duration-200 cursor-pointer group"
                  aria-label={social.label}
                >
                  {React.cloneElement(social.icon, {
                    className: "w-4 h-4 text-[#6B7280] group-hover:text-[#C79E61] transition-colors",
                  })}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#C79E61] mb-3 sm:mb-5">
              {t("footer.nav.title")}
            </h3>
            <ul className="flex flex-col gap-2 sm:gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.to)}
                    className="text-[13px] text-[#6B7280] hover:text-[#2A2622] transition-colors cursor-pointer font-light"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help — placeholder links; hidden on mobile to keep the footer compact */}
          <div className="hidden sm:block">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#C79E61] mb-3 sm:mb-5">
              {t("footer.help.title")}
            </h3>
            <ul className="flex flex-col gap-2 sm:gap-3">
              {helpLinks.map((text) => (
                <li key={text}>
                  <a
                    href="#"
                    className="text-[13px] text-[#6B7280] hover:text-[#2A2622] transition-colors font-light"
                    onClick={(e) => e.preventDefault()}
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contacts */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#C79E61] mb-3 sm:mb-5">
              {t("footer.contacts.title")}
            </h3>
            <ul className="flex flex-col gap-2.5 sm:gap-4">
              <li>
                <a
                  href="mailto:info@sigup.ru"
                  className="flex items-center gap-3 text-[13px] text-[#6B7280] hover:text-[#2A2622] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EC] flex items-center justify-center shrink-0 group-hover:bg-[#EEEAE1] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </div>
                  <span className="font-light">info@sigup.ru</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+79381234567"
                  className="flex items-center gap-3 text-[13px] text-[#6B7280] hover:text-[#2A2622] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EC] flex items-center justify-center shrink-0 group-hover:bg-[#EEEAE1] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </div>
                  <span className="font-light">+7 (938) 123-45-67</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-[13px] text-[#6B7280]">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EC] flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </div>
                  <span className="font-light">Россия, г. Майкоп</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Divider + copyright ── */}
        <div className="border-t border-[#EEEAE1] mt-8 pt-6 sm:mt-12 sm:pt-8 flex items-center justify-center">
          <p className="text-[12px] text-[#9CA3AF] font-light">
            {t("footer.copy")}
          </p>
        </div>
      </div>
    </footer>
  );
}

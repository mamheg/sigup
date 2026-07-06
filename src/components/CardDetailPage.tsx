import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../types";
import {
  MapPin, ChevronLeft, ChevronRight, MessageSquare, Instagram, Send, Phone, Globe,
  ShieldCheck, Truck, HelpCircle, ImageOff, ArrowRight, Wallet, ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { paths } from "../lib/paths";
import { useAuth } from "../lib/auth";
import { Button, Badge } from "./ui";
import ProductCard from "./catalog/ProductCard";
import CardMap from "./CardMap";

interface CardDetailPageProps {
  project: Project;
  /** Same-category published cards from GET /catalog/cards/{slug}/similar. */
  similar: Project[];
  /** API slug of the card's category — breadcrumb / «вся категория» links. */
  categorySlug?: string;
}

const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

type TabKey = "about" | "products" | "delivery" | "contacts";
const TAB_LABELS: Record<TabKey, string> = {
  about: "О проекте",
  products: "Товары",
  delivery: "Доставка и оплата",
  contacts: "Контакты",
};

export default function CardDetailPage({ project, similar, categorySlug }: CardDetailPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [photo, setPhoto] = useState(0);
  const [tab, setTab] = useState<TabKey>("about");

  useEffect(() => {
    setPhoto(0);
    setTab("about");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [project.id]);

  const photos = project.photos?.length ? project.photos : [];
  const nextPhoto = () => setPhoto((p) => (p + 1) % photos.length);
  const prevPhoto = () => setPhoto((p) => (p - 1 + photos.length) % photos.length);

  const categoryHref = categorySlug ? `${paths.catalog}?cat=${encodeURIComponent(categorySlug)}` : paths.catalog;
  const hasCoords = typeof project.lat === "number" && typeof project.lng === "number";
  const addressText = project.address || `${project.city}${project.country ? `, ${project.country}` : ""}`;

  // Only real, present contacts — no junk fallbacks.
  const contacts = [
    project.whatsapp && { key: "wa", label: "WhatsApp", Icon: MessageSquare, href: `https://wa.me/${project.whatsapp.replace(/\D/g, "")}` },
    project.telegram && { key: "tg", label: "Telegram", Icon: Send, href: `https://t.me/${project.telegram.replace("@", "")}` },
    project.instagram && { key: "ig", label: "Instagram", Icon: Instagram, href: `https://instagram.com/${project.instagram.replace("@", "")}` },
    project.phone && { key: "tel", label: "Позвонить", Icon: Phone, href: `tel:${project.phone.replace(/[^\d+]/g, "")}` },
    project.website && { key: "web", label: "Сайт", Icon: Globe, href: `https://${project.website.replace(/^https?:\/\//, "")}` },
  ].filter(Boolean) as { key: string; label: string; Icon: typeof Phone; href: string }[];

  const primary = contacts.find((c) => c.key === "wa") ?? contacts.find((c) => c.key === "tg") ?? contacts[0];
  const tabs = (Object.keys(TAB_LABELS) as TabKey[]).filter((t) => t !== "products" || (project.products?.length ?? 0) > 0);

  return (
    <div className="py-8 sm:py-12">
      <title>{`${project.name} — SiGup`}</title>
      <meta name="description" content={project.shortDescription} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-ink-faint mb-6 flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate(paths.home)} className="hover:text-brand transition-colors">Главная</button>
          <span>/</span>
          <button onClick={() => navigate(paths.catalog)} className="hover:text-brand transition-colors">Каталог</button>
          <span>/</span>
          <button onClick={() => navigate(categoryHref)} className="hover:text-brand transition-colors">{project.category}</button>
          <span>/</span>
          <span className="text-ink truncate max-w-[180px]">{project.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-[4/3] bg-canvas rounded-lg overflow-hidden border border-line img-outline group">
              <span className="absolute inset-0 flex items-center justify-center text-line-strong"><ImageOff className="w-10 h-10" /></span>
              {photos[photo] && (
                <img src={photos[photo]} alt={project.name} onError={hideBroken} className="relative w-full h-full object-cover" />
              )}
              <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm text-ink text-xs px-3 py-1 rounded-full border border-line tabular">
                {photos.length ? photo + 1 : 0} / {photos.length}
              </div>
              {photos.length > 1 && (
                <>
                  <button onClick={prevPhoto} aria-label="Предыдущее фото" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/95 shadow-card flex items-center justify-center text-ink hover:bg-surface transition active:scale-[0.96]">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextPhoto} aria-label="Следующее фото" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/95 shadow-card flex items-center justify-center text-ink hover:bg-surface transition active:scale-[0.96]">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2.5">
                {photos.map((ph, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhoto(idx)}
                    className={`aspect-[4/3] rounded-sm overflow-hidden border-2 transition-all ${idx === photo ? "border-gold" : "border-transparent hover:border-line-strong"}`}
                  >
                    <img src={ph} alt="" onError={hideBroken} className="w-full h-full object-cover img-outline" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">
              <div className="bg-surface rounded-lg border border-line p-6 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone="brand">{project.category}</Badge>
                  <Badge tone="success"><ShieldCheck className="w-3.5 h-3.5" /> Проверено SiGup</Badge>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-4 leading-tight tracking-tight text-balance">{project.name}</h1>

                <div className="flex items-center gap-1.5 text-sm text-ink-soft mt-3">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>{project.city}{project.country ? `, ${project.country}` : ""}</span>
                </div>

                <div className="border-t border-line my-5" />
                <p className="text-ink-soft leading-relaxed">{project.shortDescription}</p>

                {primary && (
                  <a href={primary.href} target="_blank" rel="noreferrer" className="mt-6 block">
                    <Button fullWidth size="lg">
                      <MessageSquare className="w-4 h-4" /> Связаться
                    </Button>
                  </a>
                )}

                {contacts.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {contacts.slice(0, 4).map(({ key, label, Icon, href }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        title={label}
                        className="flex flex-col items-center gap-1.5 py-2.5 rounded-sm border border-line hover:border-line-strong hover:bg-canvas transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gold" />
                        <span className="text-[10px] text-ink-soft">{label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {project.priceInfo && (
                <div className="bg-surface rounded-md border border-line p-4 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-sm bg-brand-muted flex items-center justify-center shrink-0"><Wallet className="w-5 h-5 text-brand" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Цены</h4>
                    <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{project.priceInfo}</p>
                  </div>
                </div>
              )}
              {project.deliveryInfo && (
                <div className="bg-surface rounded-md border border-line p-4 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-sm bg-brand-muted flex items-center justify-center shrink-0"><Truck className="w-5 h-5 text-brand" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Доставка</h4>
                    <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{project.deliveryInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <section className="bg-surface rounded-lg border border-line shadow-card overflow-hidden mb-12">
          <div className="flex overflow-x-auto scrollbar-none border-b border-line">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 sm:px-6 py-4 text-sm font-medium border-b-2 transition-colors shrink-0 ${tab === t ? "border-brand text-brand" : "border-transparent text-ink-soft hover:text-ink"}`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {tab === "about" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <p className="text-ink-soft leading-relaxed whitespace-pre-line">{project.fullDescription}</p>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-ink mb-2">Адрес и карта</h3>
                      <p className="text-sm text-ink-soft leading-relaxed flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        {addressText}
                      </p>
                      {hasCoords && (
                        <>
                          <div className="mt-3">
                            <CardMap lat={project.lat!} lng={project.lng!} />
                          </div>
                          <a
                            href={`https://www.openstreetmap.org/directions?to=${project.lat},${project.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Построить маршрут
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {tab === "products" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {project.products?.map((item) => (
                      <div key={item.id} className="bg-surface rounded-md border border-line overflow-hidden shadow-sm">
                        <div className="aspect-square bg-canvas overflow-hidden img-outline">
                          <img src={item.image} alt={item.name} onError={hideBroken} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-ink line-clamp-1">{item.name}</h4>
                          <p className="text-sm font-serif text-brand mt-0.5 tabular">{item.price}</p>
                          <p className="text-xs text-ink-faint mt-1 line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "delivery" && (
                  <div className="max-w-2xl text-ink-soft leading-relaxed flex flex-col gap-3">
                    <p>{project.deliveryInfo || "Условия доставки уточняйте у продавца напрямую."}</p>
                    <p className="text-sm text-ink-faint">SiGup — некоммерческая информационная площадка. Расчёты происходят напрямую с продавцом, без комиссий.</p>
                  </div>
                )}

                {tab === "contacts" && (
                  <ul className="flex flex-col gap-3 text-ink-soft">
                    <li className="flex items-center gap-3"><span className="text-ink font-medium">Представитель:</span> {project.authorName}</li>
                    {contacts.map(({ key, label, Icon, href }) => (
                      <li key={key} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gold" />
                        <a href={href} target="_blank" rel="noreferrer" className="hover:text-brand transition-colors">{label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mb-14">
            <div className="flex items-end justify-between mb-5">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink tracking-tight">Похожие проекты</h2>
              <button onClick={() => navigate(categoryHref)} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:gap-2 transition-all">
                Вся категория <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {similar.map((p) => <ProductCard key={p.id} project={p} />)}
            </div>
          </section>
        )}

        {/* CTA — only for signed-in users */}
        {role !== "guest" && (
        <section className="bg-surface rounded-lg border border-line p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-md bg-brand-muted flex items-center justify-center shrink-0"><HelpCircle className="w-6 h-6 text-brand" /></div>
            <div>
              <h3 className="font-serif text-xl text-ink">Представляете своё дело?</h3>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed max-w-md">Разместите проект в каталоге SiGup бесплатно и расскажите о себе сообществу по всему миру.</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate(paths.create)} className="shrink-0">Добавить проект</Button>
        </section>
        )}
      </div>
    </div>
  );
}

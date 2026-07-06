/**
 * Мапперы бэкенд-моделей (snake_case, английские статусы) в существующие
 * фронтовые типы (src/types.ts, русские enum-значения) — чтобы страницы,
 * собранные до бэкенда, продолжали работать без переписывания.
 */
import { Project, ProjectCategory, ProjectStatus, EventItem, ProductItem } from "../types";
import { ApiCard, ApiEvent, ApiProduct, CardStatus } from "./api";
import { mediaUrl } from "./media";

export const STATUS_EN_RU: Record<CardStatus, ProjectStatus> = {
  draft: ProjectStatus.Draft,
  pending: ProjectStatus.Pending,
  published: ProjectStatus.Published,
  rejected: ProjectStatus.Rejected,
  needs_revision: ProjectStatus.NeedsRevision,
  hidden: ProjectStatus.Hidden,
};

export const STATUS_RU_EN = Object.fromEntries(
  Object.entries(STATUS_EN_RU).map(([en, ru]) => [ru, en])
) as Record<ProjectStatus, CardStatus>;

function toCategory(name?: string): ProjectCategory {
  const values = Object.values(ProjectCategory) as string[];
  if (name && values.includes(name)) return name as ProjectCategory;
  // Бэкенд-категории из ТЗ, которых нет в старом enum, сводим к ближайшим
  if (name === "Изделия ручной работы") return ProjectCategory.Handwork;
  if (name === "Парфюмерия / духи") return ProjectCategory.Perfume;
  if (name === "Соль и традиционные товары") return ProjectCategory.Salt;
  if (name === "Культура и творчество") return ProjectCategory.Culture;
  return ProjectCategory.Others;
}

function toProduct(p: ApiProduct): ProductItem {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    description: p.description ?? "",
    image: mediaUrl(p.image_url),
  };
}

export function apiCardToProject(c: ApiCard): Project {
  return {
    id: c.slug, // маршруты фронта используют slug как идентификатор карточки
    name: c.name,
    category: toCategory(c.category_name),
    shortDescription: c.short_description,
    fullDescription: c.full_description ?? "",
    photos: c.photos.map((p) => mediaUrl(p.url)),
    country: c.country ?? "",
    city: c.city ?? "",
    address: c.address ?? undefined,
    lat: c.lat ?? undefined,
    lng: c.lng ?? undefined,
    instagram: c.instagram ?? undefined,
    phone: c.phone ?? undefined,
    whatsapp: c.whatsapp ?? undefined,
    telegram: c.telegram ?? undefined,
    website: c.website ?? undefined,
    priceInfo: c.price_info ?? undefined,
    deliveryInfo: c.delivery_info ?? undefined,
    status: STATUS_EN_RU[c.status],
    adminComment: c.admin_comment ?? undefined,
    authorId: String(c.owner_id),
    authorName: c.owner_name ?? "",
    products: c.products.length ? c.products.map(toProduct) : undefined,
    isFeatured: c.is_featured,
    views: c.views_count,
    clicks: c.clicks_count,
    likes: c.likes_count,
    liked: c.liked,
    numericId: c.id,
    updatedAt: new Date(c.updated_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export function apiEventToEventItem(e: ApiEvent): EventItem {
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
  const dateStr = e.date_end ? `${fmt(e.date_start)} – ${fmt(e.date_end)}` : fmt(e.date_start);
  const typeMap: Record<string, EventItem["type"]> = {
    event: "Мероприятие",
    promo: "Акция",
    announcement: "Объявление",
    other: "Событие",
  };
  return {
    id: String(e.id),
    title: e.title,
    type: typeMap[e.type] ?? (e.type as EventItem["type"]) ?? "Событие",
    image: mediaUrl(e.image_url),
    dateStr,
    location: e.location ?? "",
    shortDescription: e.description ?? "",
    fullDescription: e.description ?? undefined,
    link: e.link ?? undefined,
    status: e.status === "published" ? "Опубликовано" : e.status === "finished" ? "Завершено" : e.status === "hidden" ? "Скрыто" : "Черновик",
    isFeatured: e.is_featured,
  };
}

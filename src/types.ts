export enum ProjectStatus {
  Draft = "Черновик",
  Pending = "На проверке",
  Published = "Опубликовано",
  Rejected = "Отклонено",
  NeedsRevision = "Требует доработки",
  Hidden = "Скрыта"
}

export enum ProjectCategory {
  Products = "Продукты",
  Handwork = "Ручная работа",
  Books = "Книги",
  Perfume = "Парфюмерия",
  Services = "Услуги",
  Culture = "Культура",
  Salt = "Соль и традиции", // Соль и традиционные товары
  Apparel = "Одежда и аксессуары",
  Events = "Мероприятия",
  Others = "Другое"
}

export interface ProductItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  shortDescription: string;
  fullDescription: string;
  photos: string[];
  country: string;
  city: string;
  address?: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  website?: string;
  priceInfo?: string; // e.g. "Цены уточняйте у продавца" или конкретный текст
  deliveryInfo?: string; // e.g. "Доставка доступна", "Самовывоз"
  status: ProjectStatus;
  adminComment?: string;
  authorId: string;
  authorName: string;
  products?: ProductItem[];
  isFeatured?: boolean; // Популярные проекты
  views?: number;
  clicks?: number;
  likes?: number;
  liked?: boolean;
  numericId?: number; // id карточки в БД (для like/click); slug — в поле id
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: "Мероприятие" | "Акция" | "Объявление" | "Событие";
  image: string;
  dateStr: string;
  location: string;
  shortDescription: string;
  fullDescription?: string;
  link?: string;
  status: "Черновик" | "Опубликовано" | "Скрыто" | "Завершено";
  isFeatured?: boolean;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  status: "Черновик" | "Опубликовано" | "Скрыто";
  date: string;
}

export type AppRole = "guest" | "entrepreneur" | "admin";

export interface ModerationLog {
  id: string;
  projectTitle: string;
  action: string; // e.g., "Одобрена карточка" or "Изменен статус"
  date: string;
  user: string;
}

export interface PlatformStats {
  underVerificationCount: number;
  publishedCount: number;
  entrepreneursCount: number;
  eventsCount: number;
}

/**
 * SiGup API client — the single HTTP seam between the SPA and the FastAPI
 * backend. Token lives in localStorage and is sent as a Bearer header
 * (opaque session tokens, see backend auth_sessions).
 */

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

const TOKEN_KEY = "sigup_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Json = Record<string, unknown>;

async function request<T>(
  path: string,
  opts: { method?: string; body?: Json | FormData; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, "Сервер недоступен. Проверьте соединение.");
  }

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `Ошибка запроса (${res.status})`;
    throw new ApiError(res.status, detail);
  }
  return data as T;
}

// ─── Backend shapes (snake_case, английские статусы) ───────────────

export type Role = "entrepreneur" | "admin";
export type CardStatus = "draft" | "pending" | "published" | "rejected" | "needs_revision" | "hidden";
export type EventStatus = "draft" | "published" | "hidden" | "finished";

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  city?: string | null;
  country?: string | null;
  created_at: string;
}

export interface ApiPhoto {
  id: number;
  url: string;
  thumb_url?: string | null;
  sort_order: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  image_url?: string | null;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  cards_count?: number;
}

export interface ApiCard {
  id: number;
  slug: string;
  name: string;
  category_id: number;
  category_name?: string;
  short_description: string;
  full_description?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  instagram?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website?: string | null;
  price_info?: string | null;
  delivery_info?: string | null;
  status: CardStatus;
  admin_comment?: string | null;
  is_featured: boolean;
  owner_id: number;
  owner_name?: string;
  photos: ApiPhoto[];
  products: ApiProduct[];
  created_at: string;
  updated_at: string;
}

export interface ApiEvent {
  id: number;
  title: string;
  type: string;
  image_url?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  location?: string | null;
  description?: string | null;
  link?: string | null;
  status: EventStatus;
  is_featured: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export interface AdminStats {
  pending_cards: number;
  published_cards: number;
  entrepreneurs: number;
  events: number;
  pending_delta_7d?: number;
  published_delta_7d?: number;
  entrepreneurs_delta_7d?: number;
  events_delta_7d?: number;
}

export interface ActivityItem {
  id: number;
  kind: string; // user_registered | card_created | card_approved | card_rejected | ...
  text: string;
  created_at: string;
}

// ─── Endpoints ──────────────────────────────────────────────────────

export interface CatalogQuery {
  q?: string;
  category?: string; // category slug
  country?: string;
  city?: string;
  sort?: "new" | "featured" | "name";
  page?: number;
  per_page?: number;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const api = {
  auth: {
    sendCode: (email: string) =>
      request<{ success: boolean; message: string }>("/auth/send-code", { method: "POST", body: { email }, auth: false }),
    verifyCode: (email: string, code: string) =>
      request<{ success: boolean; message: string }>("/auth/verify-code", { method: "POST", body: { email, code }, auth: false }),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: data, auth: false }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    me: () => request<ApiUser>("/auth/me"),
    resetSendCode: (email: string) =>
      request<{ success: boolean; message: string }>("/auth/password-reset/send-code", { method: "POST", body: { email }, auth: false }),
    resetConfirm: (email: string, code: string, new_password: string) =>
      request<{ success: boolean; message: string }>("/auth/password-reset/confirm", { method: "POST", body: { email, code, new_password }, auth: false }),
  },

  catalog: {
    cards: (query: CatalogQuery = {}) => request<Paginated<ApiCard>>(`/catalog/cards${qs({ ...query })}`, { auth: false }),
    card: (slug: string) => request<ApiCard>(`/catalog/cards/${encodeURIComponent(slug)}`, { auth: false }),
    similar: (slug: string) => request<ApiCard[]>(`/catalog/cards/${encodeURIComponent(slug)}/similar`, { auth: false }),
    categories: () => request<ApiCategory[]>("/catalog/categories", { auth: false }),
    events: (featured?: boolean) => request<ApiEvent[]>(`/catalog/events${qs({ featured })}`, { auth: false }),
  },

  cabinet: {
    myCards: (status?: CardStatus) => request<ApiCard[]>(`/cabinet/cards${qs({ status })}`),
    createCard: (data: Json) => request<ApiCard>("/cabinet/cards", { method: "POST", body: data }),
    updateCard: (id: number, data: Json) => request<ApiCard>(`/cabinet/cards/${id}`, { method: "PATCH", body: data }),
    submitCard: (id: number) => request<ApiCard>(`/cabinet/cards/${id}/submit`, { method: "POST" }),
    deleteCard: (id: number) => request<void>(`/cabinet/cards/${id}`, { method: "DELETE" }),
    uploadPhoto: (cardId: number, file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return request<ApiPhoto>(`/cabinet/cards/${cardId}/photos`, { method: "POST", body: fd });
    },
    deletePhoto: (cardId: number, photoId: number) =>
      request<void>(`/cabinet/cards/${cardId}/photos/${photoId}`, { method: "DELETE" }),
    updateProfile: (data: Json) => request<ApiUser>("/cabinet/profile", { method: "PATCH", body: data }),
  },

  admin: {
    stats: () => request<AdminStats>("/admin/stats"),
    activity: () => request<ActivityItem[]>("/admin/activity"),
    cards: (status?: CardStatus | "all") => request<ApiCard[]>(`/admin/cards${qs({ status })}`),
    approve: (id: number) => request<ApiCard>(`/admin/cards/${id}/approve`, { method: "POST" }),
    reject: (id: number, comment: string) =>
      request<ApiCard>(`/admin/cards/${id}/reject`, { method: "POST", body: { comment } }),
    needsRevision: (id: number, comment: string) =>
      request<ApiCard>(`/admin/cards/${id}/needs-revision`, { method: "POST", body: { comment } }),
    hide: (id: number) => request<ApiCard>(`/admin/cards/${id}/hide`, { method: "POST" }),
    show: (id: number) => request<ApiCard>(`/admin/cards/${id}/show`, { method: "POST" }),
    updateCard: (id: number, data: Json) => request<ApiCard>(`/admin/cards/${id}`, { method: "PATCH", body: data }),
    users: () => request<(ApiUser & { cards_count: number })[]>("/admin/users"),
    createCategory: (data: { name: string; sort_order?: number }) =>
      request<ApiCategory>("/admin/categories", { method: "POST", body: data }),
    updateCategory: (id: number, data: Json) => request<ApiCategory>(`/admin/categories/${id}`, { method: "PATCH", body: data }),
    deleteCategory: (id: number) => request<void>(`/admin/categories/${id}`, { method: "DELETE" }),
    events: () => request<ApiEvent[]>("/admin/events"),
    createEvent: (data: Json) => request<ApiEvent>("/admin/events", { method: "POST", body: data }),
    updateEvent: (id: number, data: Json) => request<ApiEvent>(`/admin/events/${id}`, { method: "PATCH", body: data }),
    deleteEvent: (id: number) => request<void>(`/admin/events/${id}`, { method: "DELETE" }),
  },
};

import { API_URL } from "./api";

/**
 * Uploaded photos come back as backend-relative URLs ("/static/uploads/…").
 * When the API lives on another origin (dev: VITE_API_URL=http://host:port/api)
 * those must be resolved against the API host, not the SPA host.
 */
const API_ORIGIN = /^https?:\/\//.test(API_URL) ? new URL(API_URL).origin : "";

export function mediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith("/") ? `${API_ORIGIN}${url}` : url;
}

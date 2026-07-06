import React from "react";
import { mediaUrl } from "../../lib/media";

// A broken avatar collapses to reveal the initial-letter fallback beneath.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

export interface AvatarProps {
  name?: string | null;
  /** Uploaded/linked avatar URL; falls back to the initial letter when empty. */
  src?: string | null;
  /** Sizing, background and text utilities — the caller owns the visual scale. */
  className?: string;
}

/**
 * User avatar: shows the uploaded photo when present, otherwise the name's
 * first letter. Reused in the cabinet sidebar, profile settings and admin bar.
 */
export default function Avatar({ name, src, className = "" }: AvatarProps) {
  const initial = (name ?? "?").trim().slice(0, 1).toUpperCase() || "?";
  const url = mediaUrl(src);
  return (
    <span className={`relative inline-flex items-center justify-center rounded-full overflow-hidden select-none shrink-0 ${className}`}>
      {url ? <img src={url} alt="" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover" /> : initial}
    </span>
  );
}

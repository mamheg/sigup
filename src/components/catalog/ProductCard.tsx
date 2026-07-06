import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ImageOff, Heart } from "lucide-react";
import { Project } from "../../types";
import { paths } from "../../lib/paths";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Badge, Skeleton } from "../ui";

// Hide a broken image so the neutral placeholder shows instead of raw alt text.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.opacity = "0";
};

/**
 * Premium marketplace product card (KTD-5): square image with a neutral
 * outline, hover second-image swap + lift, 2-line title with a fixed height so
 * rows stay aligned, emphasized price. No ratings — out of MVP (KTD-9).
 */
export default function ProductCard({ project }: { project: Project }) {
  const hasSecond = project.photos.length > 1;
  const { role } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(!!project.liked);
  const [likes, setLikes] = useState(project.likes ?? 0);
  const [likeBusy, setLikeBusy] = useState(false);

  // The card is a Link — the heart must not navigate to the detail page.
  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (role === "guest") {
      navigate(paths.login);
      return;
    }
    if (likeBusy) return;
    const next = !liked;
    setLiked(next); // optimistic
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    setLikeBusy(true);
    try {
      const res = next ? await api.catalog.like(project.id) : await api.catalog.unlike(project.id);
      setLiked(res.liked);
      setLikes(res.likes_count);
    } catch {
      setLiked(!next); // revert on failure
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    } finally {
      setLikeBusy(false);
    }
  };

  return (
    <Link
      id={`catalog-card-${project.id}`}
      to={paths.project(project.id)}
      className="group h-full flex flex-col bg-surface border border-line rounded-md shadow-card overflow-hidden
                 transition-[box-shadow,translate,border-color] duration-200 ease-out
                 hover:shadow-pop hover:border-line-strong [@media(hover:hover)]:hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-canvas img-outline">
        <span className="absolute inset-0 flex items-center justify-center text-line-strong">
          <ImageOff className="w-8 h-8" />
        </span>
        <img
          src={project.photos[0]}
          alt={project.name}
          loading="lazy"
          onError={hideBroken}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            hasSecond ? "group-hover:opacity-0" : ""
          }`}
        />
        {hasSecond && (
          <img
            src={project.photos[1]}
            alt=""
            aria-hidden
            loading="lazy"
            onError={hideBroken}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {project.isFeatured && (
          <span className="absolute top-2 left-2">
            <Badge tone="gold">Популярное</Badge>
          </span>
        )}
        <button
          type="button"
          onClick={toggleLike}
          disabled={likeBusy}
          aria-pressed={liked}
          aria-label={liked ? "Убрать из избранного" : "Добавить в избранное"}
          className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 h-8 px-2 rounded-full bg-surface/90 backdrop-blur-sm border border-line text-ink-soft shadow-sm hover:text-red-500 hover:border-line-strong transition-colors active:scale-[0.92] cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`} />
          {likes > 0 && <span className="text-xs font-medium tabular pr-0.5">{likes}</span>}
        </button>
      </div>

      <div className="flex flex-col flex-grow p-3.5">
        {/* Fixed 2-line title box — keeps every card the same height */}
        <h3 className="font-medium text-ink text-[15px] leading-snug line-clamp-2 h-[2.6em]">
          {project.name}
        </h3>
        {/* Price slot is always reserved (nbsp when empty) and never wraps */}
        <p className="mt-1.5 font-serif text-lg text-brand tabular line-clamp-1 min-h-[1.75rem]">
          {project.priceInfo || " "}
        </p>
        <div className="mt-auto pt-2.5 flex items-center gap-1 text-xs text-ink-faint">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{project.city}</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface border border-line rounded-md overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3.5 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20 mt-1" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  );
}

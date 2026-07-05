import { Link } from "react-router-dom";
import { MapPin, ImageOff } from "lucide-react";
import { Project } from "../../types";
import { paths } from "../../lib/paths";
import { Rating, Badge, Skeleton } from "../ui";

// Hide a broken image so the neutral placeholder shows instead of raw alt text.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.opacity = "0";
};

/**
 * Premium marketplace product card (KTD-5): square image with a neutral
 * outline, hover second-image swap + lift, 2-line title with a fixed height so
 * rows stay aligned, emphasized price, always-visible rating.
 */
export default function ProductCard({ project }: { project: Project }) {
  const hasSecond = project.photos.length > 1;
  return (
    <Link
      id={`catalog-card-${project.id}`}
      to={paths.project(project.id)}
      className="group flex flex-col bg-surface border border-line rounded-md shadow-card overflow-hidden
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
      </div>

      <div className="flex flex-col flex-grow p-3.5">
        <Rating value={project.rating ?? 5} className="mb-1.5" />
        <h3 className="font-medium text-ink text-[15px] leading-snug line-clamp-2 min-h-[2.6em]">
          {project.name}
        </h3>
        {project.priceInfo && (
          <p className="mt-1.5 font-serif text-lg text-brand tabular">{project.priceInfo}</p>
        )}
        <div className="mt-auto pt-2.5 flex items-center gap-1 text-xs text-ink-faint">
          <MapPin className="w-3.5 h-3.5" />
          {project.city}
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
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20 mt-1" />
      </div>
    </div>
  );
}

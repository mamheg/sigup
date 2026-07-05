import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin } from "lucide-react";
import { useStore } from "../lib/store";
import { paths } from "../lib/paths";
import { ProjectCategory, ProjectStatus, Project } from "../types";
import { Badge } from "../components/ui";

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  return (
    <button
      id={`catalog-card-${project.id}`}
      onClick={() => navigate(paths.project(project.id))}
      className="group text-left bg-surface border border-line rounded-md shadow-card overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-pop hover:border-line-strong cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        <img
          src={project.photos[0]}
          alt={project.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {project.isFeatured && (
          <span className="absolute top-2 left-2">
            <Badge tone="gold">Популярное</Badge>
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1 text-gold-dark text-xs font-semibold mb-1">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          {(project.rating ?? 5).toFixed(1)}
        </div>
        <h3 className="font-medium text-ink text-[15px] leading-snug line-clamp-2 min-h-[2.6em]">{project.name}</h3>
        <p className="mt-1 text-[13px] text-ink-soft line-clamp-2">{project.shortDescription}</p>
        <div className="mt-2.5 flex items-center gap-1 text-xs text-ink-faint">
          <MapPin className="w-3.5 h-3.5" />
          {project.city}
        </div>
      </div>
    </button>
  );
}

export default function CatalogPage() {
  const { projects } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "all">("all");

  const published = useMemo(() => projects.filter((p) => p.status === ProjectStatus.Published), [projects]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return published.filter((p) => {
      const matchesCat = category === "all" || p.category === category;
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [published, query, category]);

  const categories = useMemo(() => {
    const present = new Set(published.map((p) => p.category));
    return Object.values(ProjectCategory).filter((c) => present.has(c));
  }, [published]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <title>Каталог — SiGup</title>
      <meta name="description" content="Каталог черкесских товаров, услуг и предпринимателей: сыр, ремесло, книги, одежда и другое." />

      <header className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink">Каталог</h1>
        <p className="mt-1 text-ink-soft">Товары, услуги и мастера черкесского сообщества.</p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Что вы ищете? Например: сыр, одежда, мастерская…"
          className="w-full h-12 pl-10 pr-4 rounded-sm bg-surface border border-line text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setCategory("all")}
          className={`px-3.5 h-9 rounded-full text-sm font-medium border transition-colors ${
            category === "all" ? "bg-brand text-brand-fg border-brand" : "bg-surface text-ink-soft border-line hover:border-line-strong"
          }`}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 h-9 rounded-full text-sm font-medium border transition-colors ${
              category === c ? "bg-brand text-brand-fg border-brand" : "bg-surface text-ink-soft border-line hover:border-line-strong"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-sm text-ink-faint mb-4">Найдено: {results.length}</p>

      {results.length === 0 ? (
        <div className="py-20 text-center text-ink-soft">
          Ничего не найдено.{" "}
          <button className="text-brand font-medium hover:underline" onClick={() => { setQuery(""); setCategory("all"); }}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {results.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

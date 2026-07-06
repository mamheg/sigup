import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate, type RouteObject } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import RootLayout from "./components/layout/RootLayout";
import { api, ApiCategory, ApiError } from "./lib/api";
import { apiCardToProject, apiEventToEventItem } from "./lib/mappers";
import { Project, EventItem } from "./types";
import { paths } from "./lib/paths";

import MainPage from "./components/MainPage";
import CardDetailPage from "./components/CardDetailPage";
import EntrepreneurCabinet from "./components/EntrepreneurCabinet";
import CreateCardPage from "./components/CreateCardPage";
import AdminLayout from "./components/admin/AdminLayout";
import AboutPage from "./components/AboutPage";
import CatalogPage from "./pages/CatalogPage";
import AfishaPage from "./pages/AfishaPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import ModerationPage from "./pages/admin/ModerationPage";
import AdminCardsPage from "./pages/admin/CardsPage";
import UsersPage from "./pages/admin/UsersPage";
import EventsPage from "./pages/admin/EventsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import { Button, Skeleton } from "./components/ui";

// ─── Route wrappers: fetch from the API and adapt to component props ───

function HomeRoute() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      api.catalog.cards({ sort: "featured", per_page: 12 }),
      api.catalog.events(true),
      api.catalog.categories(),
    ]).then(([cardsRes, eventsRes, catsRes]) => {
      if (!alive) return;
      if (cardsRes.status === "fulfilled") setProjects(cardsRes.value.items.map(apiCardToProject));
      if (eventsRes.status === "fulfilled") setEvents(eventsRes.value.map(apiEventToEventItem));
      if (catsRes.status === "fulfilled") setCategories(catsRes.value);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return <MainPage projects={projects} events={events} categories={categories} loading={loading} />;
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Skeleton className="h-4 w-72 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Skeleton className="aspect-[4/3] rounded-lg" />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

function DetailRoute() {
  const { id } = useParams(); // id = card slug
  const [project, setProject] = useState<Project | null>(null);
  const [similar, setSimilar] = useState<Project[]>([]);
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setProject(null);
    setNotFound(false);
    setError(null);
    api.catalog
      .card(id)
      .then((card) => {
        if (!alive) return;
        setProject(apiCardToProject(card));
        // Secondary data — best-effort, never blocks the page.
        api.catalog
          .similar(id)
          .then((cards) => alive && setSimilar(cards.map(apiCardToProject)))
          .catch(() => {});
        api.catalog
          .categories()
          .then((cats) => alive && setCategorySlug(cats.find((c) => c.id === card.category_id)?.slug))
          .catch(() => {});
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
        else setError(e instanceof Error ? e.message : "Не удалось загрузить карточку");
      });
    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  if (notFound) return <Navigate to="/404" replace />;
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-ink-soft">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => setReloadKey((k) => k + 1)}>
          <RotateCcw className="w-4 h-4" /> Повторить
        </Button>
      </div>
    );
  }
  if (!project) return <DetailSkeleton />;
  return <CardDetailPage project={project} similar={similar} categorySlug={categorySlug} />;
}

function AboutRoute() {
  const navigate = useNavigate();
  return <AboutPage onBack={() => navigate(paths.home)} />;
}

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: "catalog", element: <CatalogPage /> },
      { path: "catalog/:id", element: <DetailRoute /> },
      { path: "afisha", element: <AfishaPage /> },
      { path: "about", element: <AboutRoute /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "reset", element: <ResetPasswordPage /> },
      { path: "cabinet", element: <ProtectedRoute><EntrepreneurCabinet /></ProtectedRoute> },
      { path: "cabinet/new", element: <ProtectedRoute><CreateCardPage /></ProtectedRoute> },
      { path: "cabinet/edit/:id", element: <ProtectedRoute><CreateCardPage /></ProtectedRoute> },
      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute admin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "moderation", element: <ModerationPage /> },
      { path: "cards", element: <AdminCardsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
];

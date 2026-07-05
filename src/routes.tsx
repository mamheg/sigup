import { useState } from "react";
import { useNavigate, useParams, Navigate, type RouteObject } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import { useStore } from "./lib/store";
import { paths } from "./lib/paths";

import MainPage from "./components/MainPage";
import CardDetailPage from "./components/CardDetailPage";
import EntrepreneurCabinet from "./components/EntrepreneurCabinet";
import AdminPanel from "./components/AdminPanel";
import CreateCardPage from "./components/CreateCardPage";
import AboutPage from "./components/AboutPage";
import CatalogPage from "./pages/CatalogPage";
import AfishaPage from "./pages/AfishaPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import NotFoundPage from "./pages/NotFoundPage";

// ─── Route wrappers: adapt store + router to existing component props ───

function HomeRoute() {
  const { projects, events, announcements } = useStore();
  const navigate = useNavigate();
  return (
    <MainPage
      projects={projects}
      events={events}
      announcements={announcements}
      onSelectProject={(id) => navigate(paths.project(id))}
      onOpenAddCardModal={() => navigate(paths.create)}
    />
  );
}

function DetailRoute() {
  const { id } = useParams();
  const { projects } = useStore();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);
  if (!project) return <Navigate to="/404" replace />;
  return (
    <CardDetailPage
      project={project}
      allProjects={projects}
      onSelectProject={(pid) => navigate(paths.project(pid))}
      onBack={() => navigate(paths.catalog)}
      onOpenAddCardModal={() => navigate(paths.create)}
    />
  );
}

function CabinetRoute() {
  const { projects, createProject, updateProject, deleteProject } = useStore();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  return (
    <EntrepreneurCabinet
      projects={projects}
      onCreateCard={(p) => createProject(p)}
      onUpdateCard={updateProject}
      onDeleteCard={deleteProject}
      onSelectProject={(id) => navigate(paths.project(id))}
      onOpenAddCardModal={() => navigate(paths.create)}
      isAddModalOpen={isAddModalOpen}
      setIsAddModalOpen={setIsAddModalOpen}
    />
  );
}

function AdminRoute() {
  const { projects, events, approveProject, rejectProject } = useStore();
  const navigate = useNavigate();
  return (
    <AdminPanel
      projects={projects}
      events={events}
      onApproveProject={approveProject}
      onRejectProject={rejectProject}
      onSelectProject={(id) => navigate(paths.project(id))}
    />
  );
}

function CreateRoute() {
  const { createProject } = useStore();
  const navigate = useNavigate();
  return (
    <CreateCardPage
      onCreateCard={(p) => {
        createProject(p);
        navigate(paths.cabinet);
      }}
      onBack={() => navigate(-1)}
    />
  );
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
      { path: "announcements", element: <AnnouncementsPage /> },
      { path: "about", element: <AboutRoute /> },
      { path: "cabinet", element: <CabinetRoute /> },
      { path: "cabinet/new", element: <CreateRoute /> },
      { path: "admin", element: <AdminRoute /> },
      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

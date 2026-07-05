import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  AppRole,
  Project,
  ProjectStatus,
  EventItem,
  AnnouncementItem,
} from "../types";
import { initialProjects, initialEvents, initialAnnouncements } from "../initialData";

/**
 * App-wide data + session store.
 *
 * This is the seam that U3 swaps for Supabase: today it holds seed data in
 * memory and mutates locally; the API surface (projects, create/update/…,
 * role) stays the same when `src/lib/api.ts` starts talking to the backend.
 */
interface StoreValue {
  // session (temporary — replaced by Supabase auth in U4)
  role: AppRole;
  setRole: (r: AppRole) => void;

  // content
  projects: Project[];
  events: EventItem[];
  announcements: AnnouncementItem[];

  // mutations
  createProject: (p: Omit<Project, "id" | "authorId" | "authorName" | "updatedAt">) => Project;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  approveProject: (id: string) => void;
  rejectProject: (id: string, comment: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("guest");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [events] = useState<EventItem[]>(initialEvents);
  const [announcements] = useState<AnnouncementItem[]>(initialAnnouncements);

  const createProject: StoreValue["createProject"] = (newProj) => {
    const timestamp = new Date().toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const created: Project = {
      ...newProj,
      id: `proj-${Date.now()}`,
      authorId: "asker-khakunov",
      authorName: "Аскер Хакунов",
      updatedAt: timestamp,
      rating: newProj.rating ?? 5.0,
      isFeatured: false,
    };
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateProject: StoreValue["updateProject"] = (updated) =>
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const deleteProject: StoreValue["deleteProject"] = (id) =>
    setProjects((prev) => prev.filter((p) => p.id !== id));

  const approveProject: StoreValue["approveProject"] = (id) =>
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: ProjectStatus.Published, adminComment: "", updatedAt: "Одобрено модератором" }
          : p
      )
    );

  const rejectProject: StoreValue["rejectProject"] = (id, comment) =>
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: ProjectStatus.NeedsRevision, adminComment: comment, updatedAt: "Требует доработки" }
          : p
      )
    );

  return (
    <StoreContext.Provider
      value={{
        role,
        setRole,
        projects,
        events,
        announcements,
        createProject,
        updateProject,
        deleteProject,
        approveProject,
        rejectProject,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within DataProvider");
  return ctx;
}

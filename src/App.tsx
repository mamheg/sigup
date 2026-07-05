/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/MainPage";
import CardDetailPage from "./components/CardDetailPage";
import EntrepreneurCabinet from "./components/EntrepreneurCabinet";
import AdminPanel from "./components/AdminPanel";
import AboutPage from "./components/AboutPage";
import CreateCardPage from "./components/CreateCardPage";

import { AppRole, Project, ProjectStatus, EventItem, AnnouncementItem } from "./types";
import { initialProjects, initialEvents, initialAnnouncements } from "./initialData";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Global States
  const [currentRole, setCurrentRole] = useState<AppRole>("guest");
  const [currentSection, setCurrentSection] = useState<string>("main");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Database States
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);

  // Navigation to create card page
  const navigateToCreateCard = () => {
    setCurrentRole("entrepreneur");
    setCurrentSection("create_card");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Retrieve currently selected project for detail view
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Global Actions
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentSection("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToMain = () => {
    setSelectedProjectId(null);
    setCurrentSection("main");
  };

  const handleApproveProject = (id: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: ProjectStatus.Published,
            adminComment: "",
            updatedAt: "Одобрено модератором"
          };
        }
        return p;
      })
    );
  };

  const handleRejectProject = (id: string, comment: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: ProjectStatus.NeedsRevision,
            adminComment: comment,
            updatedAt: "Требует доработки"
          };
        }
        return p;
      })
    );
  };

  const handleCreateCard = (newProj: Omit<Project, "id" | "authorId" | "authorName" | "updatedAt">) => {
    const timestamp = new Date().toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const newId = `proj-${Date.now()}`;
    const fullNewProject: Project = {
      ...newProj,
      id: newId,
      authorId: "asker-khakunov",
      authorName: "Аскер Хакунов",
      updatedAt: timestamp,
      rating: 5.0,
      isFeatured: false
    };

    setProjects(prev => [fullNewProject, ...prev]);
  };

  const handleUpdateCard = (updatedProj: Project) => {
    setProjects(prev => prev.map(p => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleDeleteCard = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col justify-between selection:bg-[#244D33]/10 selection:text-stone-900 overflow-x-hidden">
      {/* Header Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onOpenAddCardModal={navigateToCreateCard}
      />

      {/* Main interactive route viewport with animations */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentSection === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MainPage
                projects={projects}
                events={events}
                announcements={announcements}
                onSelectProject={handleSelectProject}
                onOpenAddCardModal={navigateToCreateCard}
              />
            </motion.div>
          )}

          {currentSection === "detail" && activeProject && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CardDetailPage
                project={activeProject}
                allProjects={projects}
                onSelectProject={handleSelectProject}
                onBack={handleBackToMain}
                onOpenAddCardModal={navigateToCreateCard}
              />
            </motion.div>
          )}

          {currentSection === "cabinet" && (
            <motion.div
              key="cabinet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EntrepreneurCabinet
                projects={projects}
                onCreateCard={handleCreateCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                onSelectProject={handleSelectProject}
                onOpenAddCardModal={navigateToCreateCard}
                isAddModalOpen={false}
                setIsAddModalOpen={() => {}}
              />
            </motion.div>
          )}

          {currentSection === "admin_panel" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel
                projects={projects}
                events={events}
                onApproveProject={handleApproveProject}
                onRejectProject={handleRejectProject}
                onSelectProject={handleSelectProject}
              />
            </motion.div>
          )}

          {currentSection === "create_card" && (
            <motion.div
              key="create_card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CreateCardPage
                onCreateCard={handleCreateCard}
                onBack={() => {
                  setCurrentSection(currentRole === "entrepreneur" ? "cabinet" : "main");
                }}
              />
            </motion.div>
          )}

          {currentSection === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AboutPage onBack={handleBackToMain} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer bar */}
      <Footer onSectionChange={setCurrentSection} />
    </div>
  );
}

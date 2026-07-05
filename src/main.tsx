import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { LanguageProvider } from "./LanguageContext";
import { DataProvider } from "./lib/store";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </LanguageProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { createRouter, RouterProvider } from "@tanstack/react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { CompetitiveTimerProvider } from "@/contexts/CompetitiveTimerContext";
import { GameProvider } from "@/contexts/GameContext";

import { routeTree } from "./routeTree.gen";

import "leaflet/dist/leaflet.css";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <CompetitiveTimerProvider>
          <GameProvider>
            <RouterProvider router={router} />
          </GameProvider>
        </CompetitiveTimerProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}

import { createRouter, RouterContextProvider } from "@tanstack/react-router";
import { mount } from "cypress/react";

import { GameProvider } from "@/contexts/GameContext";
import { routeTree } from "@/routeTree.gen";

import { Header } from "./Header";

describe("Header", () => {
  it("should render the header contents", () => {
    const router = createRouter({ routeTree });
    mount(
      <>
        <RouterContextProvider router={router}>
          <GameProvider>
            <Header />
          </GameProvider>
        </RouterContextProvider>
      </>,
    );
    cy.contains("CountryGuessr").should("exist");
    cy.contains("Play").should("exist");
    cy.contains("Stats").should("exist");
  });
});

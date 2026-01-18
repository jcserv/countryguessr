import React from "react";

import { GameProvider, useGameContext } from "@/contexts/GameContext";
import type { CountriesGeoJSON } from "@/types/country";

import { GameOverDialog } from "./GameOverDialog";

// Mock country data
const mockCountriesData: CountriesGeoJSON = {
  type: "FeatureCollection",
  features: Array.from({ length: 3 }, (_, i) => ({
    type: "Feature" as const,
    properties: {
      NAME: `Country ${i}`,
      NAME_LONG: `Country ${i}`,
      ISO_A2: `C${i}`,
      REGION_UN: "Americas",
      SUBREGION: "Test",
    },
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    },
  })),
};

// Helper component to trigger loss state
function LoseGameController({ children }: { children: React.ReactNode }) {
  const { startGame, endGame, countries } = useGameContext();
  const hasTriggeredRef = React.useRef(false);

  React.useEffect(() => {
    if (countries.length === 0 || hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    startGame();
    setTimeout(() => {
      endGame();
    }, 100);
  }, [countries, startGame, endGame]);

  return <>{children}</>;
}

describe("GameOverDialog", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data/countries.geojson", {
      statusCode: 200,
      body: mockCountriesData,
    }).as("getCountries");
  });

  describe("defeat UI", () => {
    it("shows Game over title on loss", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Game over", { timeout: 10000 }).should("be.visible");
    });

    it("shows XCircle icon on loss", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.get(".text-red-500", { timeout: 10000 }).should("exist");
    });

    it("shows defeat message on loss", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      // When endGame() is called directly, it sets status to lost but doesn't modify lives,
      // so the condition shows "Time ran out!" message
      cy.contains("Time ran out!", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("stats display on loss", () => {
    it("shows correct guesses count", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Correct", { timeout: 10000 }).should("be.visible");
      cy.contains("0/3", { timeout: 10000 }).should("be.visible");
    });

    it("shows time elapsed", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Time Elapsed", { timeout: 10000 }).should("be.visible");
    });

    it("shows lives remaining", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Lives Remaining", { timeout: 10000 }).should("be.visible");
    });

    it("shows accuracy percentage", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Accuracy", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("share functionality", () => {
    it("shows Share Results button", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Share Results", { timeout: 10000 }).should("be.visible");
    });

    it("switches to share mode when Share Results is clicked", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Share Results", { timeout: 10000 }).click();
      cy.get("textarea").should("be.visible");
      cy.contains("Copy to Clipboard").should("be.visible");
    });

    it("shows Back to results button in share mode", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Share Results", { timeout: 10000 }).click();
      cy.contains("Back to results").should("be.visible");
    });

    it("returns to base mode when Back to results is clicked", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Share Results", { timeout: 10000 }).click();
      cy.contains("Back to results").click();
      cy.contains("Share Results").should("be.visible");
      cy.get("textarea").should("not.exist");
    });
  });

  describe("Play Again button", () => {
    it("shows Play Again button", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Play Again", { timeout: 10000 }).should("be.visible");
    });

    it("calls resetGame when Play Again is clicked", () => {
      cy.mount(
        <GameProvider>
          <LoseGameController>
            <GameOverDialog />
          </LoseGameController>
        </GameProvider>,
      );

      cy.wait("@getCountries");
      cy.contains("Game over", { timeout: 10000 }).should("be.visible");
      cy.contains("Play Again").click();
      cy.contains("Game over").should("not.exist");
    });
  });
});

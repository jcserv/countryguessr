import React from "react";

import { GameProvider, useGameContext } from "@/contexts/GameContext";
import type { CountriesGeoJSON } from "@/types/country";

import { ProgressCard } from "./ProgressCard";

// Mock country data with different regions
const mockCountriesData: CountriesGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        NAME: "France",
        NAME_LONG: "France",
        ISO_A2: "FR",
        REGION_UN: "Europe",
        SUBREGION: "Western Europe",
      },
      geometry: {
        type: "Polygon",
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
    },
    {
      type: "Feature",
      properties: {
        NAME: "United States",
        NAME_LONG: "United States of America",
        ISO_A2: "US",
        REGION_UN: "Americas",
        SUBREGION: "Northern America",
      },
      geometry: {
        type: "Polygon",
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
    },
    {
      type: "Feature",
      properties: {
        NAME: "Nigeria",
        NAME_LONG: "Nigeria",
        ISO_A2: "NG",
        REGION_UN: "Africa",
        SUBREGION: "Western Africa",
      },
      geometry: {
        type: "Polygon",
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
    },
    {
      type: "Feature",
      properties: {
        NAME: "Saudi Arabia",
        NAME_LONG: "Saudi Arabia",
        ISO_A2: "SA",
        REGION_UN: "Asia",
        SUBREGION: "Western Asia",
      },
      geometry: {
        type: "Polygon",
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
    },
    {
      type: "Feature",
      properties: {
        NAME: "Japan",
        NAME_LONG: "Japan",
        ISO_A2: "JP",
        REGION_UN: "Asia",
        SUBREGION: "Eastern Asia",
      },
      geometry: {
        type: "Polygon",
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
    },
  ],
};

// Helper component to trigger game start
function GameStarter({ children }: { children: React.ReactNode }) {
  const { startGame, countries } = useGameContext();

  React.useEffect(() => {
    if (countries.length > 0) {
      startGame();
    }
  }, [countries, startGame]);

  return <>{children}</>;
}

describe("ProgressCard", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data/countries.geojson", {
      statusCode: 200,
      body: mockCountriesData,
    }).as("getCountries");
  });

  describe("stats display", () => {
    it("displays CORRECT stat", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("CORRECT").should("be.visible");
      cy.contains("0").should("be.visible"); // Initial correct count
    });

    it("displays REMAINING stat", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("REMAINING").should("be.visible");
      cy.contains("5").should("be.visible"); // 5 mock countries
    });

    it("displays LIVES section with hearts", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("LIVES").should("be.visible");
      // Should have 3 hearts (via LivesDisplay)
      cy.get("svg").should("have.length.at.least", 3);
    });
  });

  describe("progress bar", () => {
    it("displays Progress label", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("Progress").should("be.visible");
    });

    it("displays percentage", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("0%").should("be.visible");
    });

    it("has progress bar element", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      // Progress bar container
      cy.get(".bg-gray-200, .dark\\:bg-gray-700").should("exist");
      // Progress bar fill
      cy.get(".bg-green-500").should("exist");
    });
  });

  describe("region progress bars", () => {
    it("displays Regions label", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("Regions").should("be.visible");
    });

    it("displays all 5 region progress bars", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("Europe").should("be.visible");
      cy.contains("Americas").should("be.visible");
      cy.contains("Africa").should("be.visible");
      cy.contains("Middle East & Central Asia").should("be.visible");
      cy.contains("Asia & Oceania").should("be.visible");
    });

    it("shows correct counts for regions", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      // Europe has 1 country (France)
      cy.contains("0/1").should("exist");

      // Americas has 1 country (US)
      // Africa has 1 country (Nigeria)
      // Middle East & Central Asia has 1 (Saudi Arabia)
      // Asia & Oceania has 1 (Japan)
    });
  });

  describe("card structure", () => {
    it("displays Your Progress title", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      cy.contains("Your Progress").should("be.visible");
    });

    it("has correct card styling", () => {
      cy.mount(
        <GameProvider>
          <GameStarter>
            <ProgressCard />
          </GameStarter>
        </GameProvider>,
      );

      cy.wait("@getCountries");

      // Card should have border and shadow
      cy.get(".rounded-lg.border").should("exist");
    });
  });
});

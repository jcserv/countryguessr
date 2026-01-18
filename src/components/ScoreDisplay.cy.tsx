import React from "react";

import { GameProvider } from "@/contexts/GameContext";
import type { CountriesGeoJSON } from "@/types/country";

import { ScoreDisplay } from "./ScoreDisplay";

// Mock country data
const mockCountriesData: CountriesGeoJSON = {
  type: "FeatureCollection",
  features: Array.from({ length: 10 }, (_, i) => ({
    type: "Feature" as const,
    properties: {
      NAME: `Country ${i}`,
      NAME_LONG: `Country ${i}`,
      ISO_A2: `C${i}`,
      REGION_UN: "Test",
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

describe("ScoreDisplay", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data/countries.geojson", {
      statusCode: 200,
      body: mockCountriesData,
    }).as("getCountries");
  });

  it("displays correct/total count format", () => {
    cy.mount(
      <GameProvider>
        <ScoreDisplay />
      </GameProvider>,
    );

    cy.wait("@getCountries");

    // Should display 0/10 initially (10 mock countries)
    cy.contains("0/10").should("be.visible");
  });

  it("displays the correct label", () => {
    cy.mount(
      <GameProvider>
        <ScoreDisplay />
      </GameProvider>,
    );

    cy.wait("@getCountries");

    cy.contains("Correct").should("be.visible");
  });

  it("displays Your Progress title", () => {
    cy.mount(
      <GameProvider>
        <ScoreDisplay />
      </GameProvider>,
    );

    cy.wait("@getCountries");

    cy.contains("Your Progress").should("be.visible");
  });

  it("displays Countries identified description", () => {
    cy.mount(
      <GameProvider>
        <ScoreDisplay />
      </GameProvider>,
    );

    cy.wait("@getCountries");

    cy.contains("Countries identified").should("be.visible");
  });

  it("shows remaining countries message", () => {
    cy.mount(
      <GameProvider>
        <ScoreDisplay />
      </GameProvider>,
    );

    cy.wait("@getCountries");

    cy.contains("10 countries remaining").should("be.visible");
  });

  describe("progress bar", () => {
    it("renders progress bar element", () => {
      cy.mount(
        <GameProvider>
          <ScoreDisplay />
        </GameProvider>,
      );

      cy.wait("@getCountries");

      // There should be a progress bar container (gray background)
      cy.get(".bg-gray-200").should("exist");
      // And an inner progress bar (green)
      cy.get(".bg-green-600").should("exist");
    });

    it("progress bar starts at 0% width", () => {
      cy.mount(
        <GameProvider>
          <ScoreDisplay />
        </GameProvider>,
      );

      cy.wait("@getCountries");

      // The green progress bar should have 0% width initially
      cy.get(".bg-green-600").should("have.attr", "style", "width: 0%;");
    });
  });

  describe("progress bar width calculation", () => {
    // Test the calculation logic directly
    it("calculates correct percentage", () => {
      const testCases = [
        { correct: 0, total: 100, expected: 0 },
        { correct: 50, total: 100, expected: 50 },
        { correct: 100, total: 100, expected: 100 },
        { correct: 25, total: 200, expected: 12.5 },
        { correct: 0, total: 0, expected: 0 },
      ];

      testCases.forEach(({ correct, total, expected }) => {
        const percentage = total > 0 ? (correct / total) * 100 : 0;
        expect(percentage).to.equal(expected);
      });
    });
  });
});

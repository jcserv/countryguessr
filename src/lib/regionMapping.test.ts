import { describe, expect, it } from "vitest";

import type { CountryFeature } from "@/types/country";

import { calculateRegionProgress, getCountryRegion } from "./regionMapping";

// Helper to create a mock country with region data
function createMockCountryWithRegion(
  code: string,
  regionUN: string,
  subregion: string,
): CountryFeature {
  return {
    type: "Feature",
    properties: {
      NAME: `Country ${code}`,
      NAME_LONG: `Country ${code}`,
      ISO_A2: code,
      REGION_UN: regionUN,
      SUBREGION: subregion,
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
  } as CountryFeature;
}

describe("regionMapping", () => {
  describe("getCountryRegion", () => {
    it("maps Europe region correctly", () => {
      const country = createMockCountryWithRegion(
        "FR",
        "Europe",
        "Western Europe",
      );
      expect(getCountryRegion(country)).toBe("Europe");
    });

    it("maps Americas region correctly", () => {
      const country = createMockCountryWithRegion(
        "US",
        "Americas",
        "Northern America",
      );
      expect(getCountryRegion(country)).toBe("Americas");
    });

    it("maps Africa region correctly", () => {
      const country = createMockCountryWithRegion(
        "NG",
        "Africa",
        "Western Africa",
      );
      expect(getCountryRegion(country)).toBe("Africa");
    });

    it("maps Western Asia to Middle East & Central Asia", () => {
      const country = createMockCountryWithRegion("SA", "Asia", "Western Asia");
      expect(getCountryRegion(country)).toBe("Middle East & Central Asia");
    });

    it("maps Central Asia to Middle East & Central Asia", () => {
      const country = createMockCountryWithRegion("KZ", "Asia", "Central Asia");
      expect(getCountryRegion(country)).toBe("Middle East & Central Asia");
    });

    it("maps remaining Asia to Asia & Oceania", () => {
      const country = createMockCountryWithRegion("JP", "Asia", "Eastern Asia");
      expect(getCountryRegion(country)).toBe("Asia & Oceania");
    });

    it("maps Oceania to Asia & Oceania", () => {
      const country = createMockCountryWithRegion(
        "AU",
        "Oceania",
        "Australia and New Zealand",
      );
      expect(getCountryRegion(country)).toBe("Asia & Oceania");
    });

    it("defaults to Asia & Oceania for unknown regions", () => {
      const country = createMockCountryWithRegion("XX", "Unknown", "Unknown");
      expect(getCountryRegion(country)).toBe("Asia & Oceania");
    });
  });

  describe("calculateRegionProgress", () => {
    const countries = [
      createMockCountryWithRegion("FR", "Europe", "Western Europe"),
      createMockCountryWithRegion("DE", "Europe", "Western Europe"),
      createMockCountryWithRegion("US", "Americas", "Northern America"),
      createMockCountryWithRegion("BR", "Americas", "South America"),
      createMockCountryWithRegion("NG", "Africa", "Western Africa"),
      createMockCountryWithRegion("SA", "Asia", "Western Asia"),
      createMockCountryWithRegion("JP", "Asia", "Eastern Asia"),
      createMockCountryWithRegion("AU", "Oceania", "Australia and New Zealand"),
    ];

    it("calculates correct percentage for each region", () => {
      const guessedCountries = new Set(["FR", "US"]);
      const progress = calculateRegionProgress(countries, guessedCountries);

      const europeProgress = progress.find((p) => p.region === "Europe");
      expect(europeProgress?.guessed).toBe(1);
      expect(europeProgress?.total).toBe(2);
      expect(europeProgress?.percentage).toBe(50);

      const americasProgress = progress.find((p) => p.region === "Americas");
      expect(americasProgress?.guessed).toBe(1);
      expect(americasProgress?.total).toBe(2);
      expect(americasProgress?.percentage).toBe(50);
    });

    it("returns 0 percentage for regions with no guessed countries", () => {
      const guessedCountries = new Set<string>();
      const progress = calculateRegionProgress(countries, guessedCountries);

      progress.forEach((region) => {
        expect(region.guessed).toBe(0);
        expect(region.percentage).toBe(0);
      });
    });

    it("returns 100 percentage when all countries in region are guessed", () => {
      const guessedCountries = new Set(["FR", "DE"]);
      const progress = calculateRegionProgress(countries, guessedCountries);

      const europeProgress = progress.find((p) => p.region === "Europe");
      expect(europeProgress?.guessed).toBe(2);
      expect(europeProgress?.total).toBe(2);
      expect(europeProgress?.percentage).toBe(100);
    });

    it("handles empty countries array", () => {
      const progress = calculateRegionProgress([], new Set());

      expect(progress).toHaveLength(5); // 5 game regions
      progress.forEach((region) => {
        expect(region.total).toBe(0);
        expect(region.guessed).toBe(0);
        expect(region.percentage).toBe(0);
      });
    });

    it("returns progress for all 5 game regions", () => {
      const progress = calculateRegionProgress(countries, new Set());

      expect(progress).toHaveLength(5);
      const regionNames = progress.map((p) => p.region);
      expect(regionNames).toContain("Europe");
      expect(regionNames).toContain("Americas");
      expect(regionNames).toContain("Africa");
      expect(regionNames).toContain("Middle East & Central Asia");
      expect(regionNames).toContain("Asia & Oceania");
    });
  });
});

import { describe, expect, it } from "vitest";

import type { CountryFeature } from "@/types/country";

import {
  filterCountries,
  findCountryByName,
  getCountryDisplayNames,
  normalizeCountryName,
} from "./countryData";

// Helper to create a mock country feature
function createMockCountry(
  code: string,
  name: string,
  longName?: string,
): CountryFeature {
  return {
    type: "Feature",
    properties: {
      NAME: name,
      NAME_LONG: longName || name,
      ISO_A2: code,
      REGION_UN: "Test",
      SUBREGION: "Test",
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

describe("countryData", () => {
  describe("normalizeCountryName", () => {
    it("converts to lowercase", () => {
      expect(normalizeCountryName("FRANCE")).toBe("france");
    });

    it("trims whitespace", () => {
      expect(normalizeCountryName("  Germany  ")).toBe("germany");
    });

    it("transliterates accented characters", () => {
      expect(normalizeCountryName("Côte d'Ivoire")).toBe("cote divoire");
      expect(normalizeCountryName("España")).toBe("espana");
      expect(normalizeCountryName("São Tomé")).toBe("sao tome");
    });

    it("converts ô to o", () => {
      expect(normalizeCountryName("Côte")).toBe("cote");
    });

    it("converts ñ to n", () => {
      expect(normalizeCountryName("España")).toBe("espana");
    });

    it("converts ß to ss", () => {
      expect(normalizeCountryName("Straße")).toBe("strasse");
    });

    it("removes special characters", () => {
      expect(normalizeCountryName("Congo (Brazzaville)")).toBe(
        "congo brazzaville",
      );
      expect(normalizeCountryName("Timor-Leste")).toBe("timorleste");
    });

    it("normalizes multiple whitespace", () => {
      expect(normalizeCountryName("South   Korea")).toBe("south korea");
    });
  });

  describe("findCountryByName", () => {
    const countries = [
      createMockCountry("US", "United States", "United States of America"),
      createMockCountry(
        "GB",
        "United Kingdom",
        "United Kingdom of Great Britain",
      ),
      createMockCountry("FR", "France", "French Republic"),
      createMockCountry("DE", "Germany", "Federal Republic of Germany"),
    ];

    it("finds by primary name", () => {
      const result = findCountryByName("France", countries);
      expect(result?.properties.ISO_A2).toBe("FR");
    });

    it("finds by long name", () => {
      const result = findCountryByName("French Republic", countries);
      expect(result?.properties.ISO_A2).toBe("FR");
    });

    it("finds by alias (case-insensitive)", () => {
      const result = findCountryByName("usa", countries);
      expect(result?.properties.ISO_A2).toBe("US");
    });

    it("finds by alias 'america'", () => {
      const result = findCountryByName("america", countries);
      expect(result?.properties.ISO_A2).toBe("US");
    });

    it("finds by alias 'uk'", () => {
      const result = findCountryByName("uk", countries);
      expect(result?.properties.ISO_A2).toBe("GB");
    });

    it("is case-insensitive", () => {
      const result = findCountryByName("GERMANY", countries);
      expect(result?.properties.ISO_A2).toBe("DE");
    });

    it("returns null for non-existent country", () => {
      const result = findCountryByName("Atlantis", countries);
      expect(result).toBeNull();
    });

    it("handles empty input", () => {
      const result = findCountryByName("", countries);
      expect(result).toBeNull();
    });
  });

  describe("getCountryDisplayNames", () => {
    it("returns primary name for country without aliases", () => {
      const country = createMockCountry("FR", "France");
      const names = getCountryDisplayNames(country);
      expect(names).toContain("France");
    });

    it("returns names including aliases for US", () => {
      const country = createMockCountry(
        "US",
        "United States",
        "United States of America",
      );
      const names = getCountryDisplayNames(country);
      expect(names).toContain("United States");
      expect(names.some((n) => n.toLowerCase().includes("usa"))).toBe(true);
    });

    it("capitalizes aliases properly", () => {
      const country = createMockCountry("GB", "United Kingdom");
      const names = getCountryDisplayNames(country);
      // Should contain properly capitalized versions
      expect(names.some((n) => /^[A-Z]/.test(n))).toBe(true);
    });
  });

  describe("filterCountries", () => {
    const countries = [
      createMockCountry("US", "United States", "United States of America"),
      createMockCountry(
        "GB",
        "United Kingdom",
        "United Kingdom of Great Britain",
      ),
      createMockCountry("AE", "United Arab Emirates", "United Arab Emirates"),
      createMockCountry("FR", "France", "French Republic"),
    ];

    it("returns all countries for empty query", () => {
      const result = filterCountries("", countries);
      expect(result).toHaveLength(4);
    });

    it("returns all countries for whitespace-only query", () => {
      const result = filterCountries("   ", countries);
      expect(result).toHaveLength(4);
    });

    it("filters by prefix matching on primary name", () => {
      const result = filterCountries("united", countries);
      expect(result).toHaveLength(3); // US, GB, AE
    });

    it("filters by prefix matching on long name", () => {
      const result = filterCountries("french", countries);
      expect(result).toHaveLength(1);
      expect(result[0].properties.ISO_A2).toBe("FR");
    });

    it("filters by prefix matching on aliases", () => {
      const result = filterCountries("uae", countries);
      expect(result).toHaveLength(1);
      expect(result[0].properties.ISO_A2).toBe("AE");
    });

    it("is case-insensitive", () => {
      const result = filterCountries("FRANCE", countries);
      expect(result).toHaveLength(1);
      expect(result[0].properties.ISO_A2).toBe("FR");
    });

    it("returns empty array when no matches", () => {
      const result = filterCountries("xyz", countries);
      expect(result).toHaveLength(0);
    });
  });
});

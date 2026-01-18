import { describe, expect, it } from "vitest";

import type { CountryFeature } from "@/types/country";

import {
  calculateCentroid,
  computeAllCentroids,
  type CountryCentroids,
  findCountryInDirection,
} from "./countryNavigation";

describe("countryNavigation", () => {
  describe("calculateCentroid", () => {
    it("calculates centroid for a simple Polygon", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      };

      const centroid = calculateCentroid(polygon);

      // Average of all coordinates (including closing point)
      // Points: (0,0), (10,0), (10,10), (0,10), (0,0)
      // Avg lng: (0+10+10+0+0)/5 = 4
      // Avg lat: (0+0+10+10+0)/5 = 4
      expect(centroid.lng).toBe(4);
      expect(centroid.lat).toBe(4);
    });

    it("calculates centroid for a MultiPolygon", () => {
      const multiPolygon: GeoJSON.MultiPolygon = {
        type: "MultiPolygon",
        coordinates: [
          // First polygon
          [
            [
              [0, 0],
              [2, 0],
              [2, 2],
              [0, 2],
              [0, 0],
            ],
          ],
          // Second polygon
          [
            [
              [4, 4],
              [6, 4],
              [6, 6],
              [4, 6],
              [4, 4],
            ],
          ],
        ],
      };

      const centroid = calculateCentroid(multiPolygon);

      // All points from both polygons:
      // Polygon 1: (0,0), (2,0), (2,2), (0,2), (0,0) - 5 points
      // Polygon 2: (4,4), (6,4), (6,6), (4,6), (4,4) - 5 points
      // Total: 10 points
      // Sum lng: 0+2+2+0+0 + 4+6+6+4+4 = 4 + 24 = 28
      // Sum lat: 0+0+2+2+0 + 4+4+6+6+4 = 4 + 24 = 28
      // Avg: 28/10 = 2.8
      expect(centroid.lng).toBe(2.8);
      expect(centroid.lat).toBe(2.8);
    });

    it("returns (0, 0) for empty geometry", () => {
      const emptyPolygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [],
      };

      const centroid = calculateCentroid(emptyPolygon);

      expect(centroid.lng).toBe(0);
      expect(centroid.lat).toBe(0);
    });
  });

  describe("findCountryInDirection", () => {
    // Create a simple centroids map for testing
    // Note: Direction algorithm finds nearest country within 90-degree cone
    const centroids: CountryCentroids = new Map([
      ["CENTER", { lng: 0, lat: 0 }], // Center reference point
      ["NORTH", { lng: 0, lat: 10 }], // Due north
      ["SOUTH", { lng: 0, lat: -10 }], // Due south
      ["EAST", { lng: 10, lat: 0 }], // Due east
      ["WEST", { lng: -10, lat: 0 }], // Due west
      ["NORTHEAST", { lng: 10, lat: 10 }], // Diagonal - at equal angle, farther away
      ["GUESSED", { lng: 0, lat: 20 }], // A country further north that will be excluded
    ]);

    it("finds country to the north (up)", () => {
      const result = findCountryInDirection(
        "CENTER",
        "up",
        centroids,
        new Set(),
      );
      expect(result).toBe("NORTH");
    });

    it("finds country to the south (down)", () => {
      const result = findCountryInDirection(
        "CENTER",
        "down",
        centroids,
        new Set(),
      );
      expect(result).toBe("SOUTH");
    });

    it("finds country to the east (right)", () => {
      const result = findCountryInDirection(
        "CENTER",
        "right",
        centroids,
        new Set(),
      );
      expect(result).toBe("EAST");
    });

    it("finds country to the west (left)", () => {
      const result = findCountryInDirection(
        "CENTER",
        "left",
        centroids,
        new Set(),
      );
      expect(result).toBe("WEST");
    });

    it("excludes guessed countries", () => {
      // North would be GUESSED but it's excluded, so should find NORTH
      const result = findCountryInDirection(
        "CENTER",
        "up",
        centroids,
        new Set(["NORTH"]),
      );
      // Should find the next closest in that direction
      expect(result).not.toBe("NORTH");
    });

    it("returns null when current country not found", () => {
      const result = findCountryInDirection(
        "NONEXISTENT",
        "up",
        centroids,
        new Set(),
      );
      expect(result).toBeNull();
    });

    it("returns null when no countries in direction", () => {
      // If we exclude all countries in a direction
      const limitedCentroids: CountryCentroids = new Map([
        ["CENTER", { lng: 0, lat: 0 }],
        ["SOUTH", { lng: 0, lat: -10 }],
      ]);

      const result = findCountryInDirection(
        "CENTER",
        "up", // Looking north, but only SOUTH exists
        limitedCentroids,
        new Set(),
      );
      expect(result).toBeNull();
    });

    it("finds nearest country when multiple exist in direction", () => {
      const centroidsWithMultiple: CountryCentroids = new Map([
        ["CENTER", { lng: 0, lat: 0 }],
        ["NEAR_NORTH", { lng: 0, lat: 5 }],
        ["FAR_NORTH", { lng: 0, lat: 20 }],
      ]);

      const result = findCountryInDirection(
        "CENTER",
        "up",
        centroidsWithMultiple,
        new Set(),
      );
      expect(result).toBe("NEAR_NORTH");
    });
  });

  describe("computeAllCentroids", () => {
    it("computes centroids for all countries", () => {
      const countries: CountryFeature[] = [
        {
          type: "Feature",
          properties: {
            ISO_A2: "AA",
            NAME: "Country A",
            NAME_LONG: "Country A",
            REGION_UN: "Test",
            SUBREGION: "Test",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [2, 0],
                [2, 2],
                [0, 2],
                [0, 0],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            ISO_A2: "BB",
            NAME: "Country B",
            NAME_LONG: "Country B",
            REGION_UN: "Test",
            SUBREGION: "Test",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [10, 10],
                [12, 10],
                [12, 12],
                [10, 12],
                [10, 10],
              ],
            ],
          },
        },
      ] as CountryFeature[];

      const centroids = computeAllCentroids(countries);

      expect(centroids.size).toBe(2);
      expect(centroids.has("AA")).toBe(true);
      expect(centroids.has("BB")).toBe(true);

      // Check centroid values are calculated
      const centroidA = centroids.get("AA");
      expect(centroidA).toBeDefined();
      expect(centroidA!.lng).toBeCloseTo(0.8, 1);
      expect(centroidA!.lat).toBeCloseTo(0.8, 1);
    });
  });
});

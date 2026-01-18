import type { CountryFeature } from "@/types/country";

export type Direction = "up" | "down" | "left" | "right";

export interface Centroid {
  lng: number;
  lat: number;
}

export type CountryCentroids = Map<string, Centroid>;

/**
 * Calculate the centroid (center point) of a GeoJSON geometry.
 * For polygons, this calculates the average of all coordinates.
 */
export function calculateCentroid(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
): Centroid {
  const coordinates: number[][] = [];

  if (geometry.type === "Polygon") {
    // Polygon has an array of rings, first is exterior
    for (const ring of geometry.coordinates) {
      for (const coord of ring) {
        coordinates.push(coord);
      }
    }
  } else if (geometry.type === "MultiPolygon") {
    // MultiPolygon has array of polygons
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) {
          coordinates.push(coord);
        }
      }
    }
  }

  if (coordinates.length === 0) {
    return { lng: 0, lat: 0 };
  }

  let sumLng = 0;
  let sumLat = 0;

  for (const coord of coordinates) {
    sumLng += coord[0];
    sumLat += coord[1];
  }

  return {
    lng: sumLng / coordinates.length,
    lat: sumLat / coordinates.length,
  };
}

/**
 * Pre-compute centroids for all countries.
 * Called once when countries are loaded.
 */
export function computeAllCentroids(
  countries: CountryFeature[],
): CountryCentroids {
  const centroids: CountryCentroids = new Map();

  for (const country of countries) {
    const code = country.properties.ISO_A2;
    const centroid = calculateCentroid(country.geometry);
    centroids.set(code, centroid);
  }

  return centroids;
}

/**
 * Normalize longitude difference to handle date line wrapping.
 * Returns the shortest angular distance between two longitudes.
 */
function normalizeLngDiff(fromLng: number, toLng: number): number {
  let diff = toLng - fromLng;

  // Normalize to [-180, 180]
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return diff;
}

/**
 * Check if a target point is within the direction cone from the current point.
 * Returns true if the target is in the specified direction (within 90 degrees).
 */
function isInDirectionCone(
  current: Centroid,
  target: Centroid,
  direction: Direction,
): boolean {
  const lngDiff = normalizeLngDiff(current.lng, target.lng);
  const latDiff = target.lat - current.lat;

  // Skip if at the same point
  if (Math.abs(lngDiff) < 0.001 && Math.abs(latDiff) < 0.001) {
    return false;
  }

  switch (direction) {
    case "right": // East: lngDiff > 0 and |lngDiff| > |latDiff|
      return lngDiff > 0 && Math.abs(lngDiff) >= Math.abs(latDiff);
    case "left": // West: lngDiff < 0 and |lngDiff| > |latDiff|
      return lngDiff < 0 && Math.abs(lngDiff) >= Math.abs(latDiff);
    case "up": // North: latDiff > 0 and |latDiff| > |lngDiff|
      return latDiff > 0 && Math.abs(latDiff) >= Math.abs(lngDiff);
    case "down": // South: latDiff < 0 and |latDiff| > |lngDiff|
      return latDiff < 0 && Math.abs(latDiff) >= Math.abs(lngDiff);
    default:
      return false;
  }
}

/**
 * Calculate distance between two centroids.
 * Uses a simple Euclidean approximation that accounts for date line wrapping.
 */
function calculateDistance(from: Centroid, to: Centroid): number {
  const lngDiff = normalizeLngDiff(from.lng, to.lng);
  const latDiff = to.lat - from.lat;
  return Math.sqrt(lngDiff * lngDiff + latDiff * latDiff);
}

/**
 * Find the nearest country in the specified direction.
 * Excludes already-guessed countries from consideration.
 */
export function findCountryInDirection(
  currentCode: string,
  direction: Direction,
  centroids: CountryCentroids,
  excludeCodes: Set<string>,
): string | null {
  const currentCentroid = centroids.get(currentCode);
  if (!currentCentroid) {
    return null;
  }

  let nearestCode: string | null = null;
  let nearestDistance = Infinity;

  for (const [code, centroid] of centroids) {
    // Skip current country and guessed countries
    if (code === currentCode || excludeCodes.has(code)) {
      continue;
    }

    // Check if this country is in the direction cone
    if (!isInDirectionCone(currentCentroid, centroid, direction)) {
      continue;
    }

    // Calculate distance and check if it's the nearest
    const distance = calculateDistance(currentCentroid, centroid);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestCode = code;
    }
  }

  return nearestCode;
}

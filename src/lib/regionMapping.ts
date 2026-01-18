import type { CountryFeature } from "@/types/country";
import type { GameRegion, RegionProgress } from "@/types/game";
import { GAME_REGIONS } from "@/types/game";

// Subregions that belong to Middle East & Central Asia
const MIDDLE_EAST_CENTRAL_ASIA_SUBREGIONS = ["Western Asia", "Central Asia"];

/**
 * Maps a country to one of the 5 game regions based on UN region and subregion
 */
export function getCountryRegion(country: CountryFeature): GameRegion {
  const properties = country.properties;
  const regionUN = properties.REGION_UN;
  const subregion = properties.SUBREGION;

  // Europe
  if (regionUN === "Europe") {
    return "Europe";
  }

  // Americas
  if (regionUN === "Americas") {
    return "Americas";
  }

  // Africa
  if (regionUN === "Africa") {
    return "Africa";
  }

  // Middle East & Central Asia (Western Asia + Central Asia)
  if (subregion && MIDDLE_EAST_CENTRAL_ASIA_SUBREGIONS.includes(subregion)) {
    return "Middle East & Central Asia";
  }

  // Asia & Oceania (remaining Asia + Oceania)
  if (regionUN === "Asia" || regionUN === "Oceania") {
    return "Asia & Oceania";
  }

  // Default fallback (shouldn't happen with proper data)
  return "Asia & Oceania";
}

/**
 * Groups countries by their game region
 */
export function groupCountriesByRegion(
  countries: CountryFeature[],
): Map<GameRegion, CountryFeature[]> {
  const regionMap = new Map<GameRegion, CountryFeature[]>();

  // Initialize all regions with empty arrays
  for (const region of GAME_REGIONS) {
    regionMap.set(region, []);
  }

  // Group countries
  for (const country of countries) {
    const region = getCountryRegion(country);
    regionMap.get(region)!.push(country);
  }

  return regionMap;
}

/**
 * Calculates progress for each region
 */
export function calculateRegionProgress(
  countries: CountryFeature[],
  guessedCountries: Set<string>,
): RegionProgress[] {
  const regionMap = groupCountriesByRegion(countries);

  return GAME_REGIONS.map((region) => {
    const regionCountries = regionMap.get(region) || [];
    const total = regionCountries.length;
    const guessed = regionCountries.filter((c) =>
      guessedCountries.has(c.properties.ISO_A2),
    ).length;
    const percentage = total > 0 ? (guessed / total) * 100 : 0;

    return {
      region,
      guessed,
      total,
      percentage,
    };
  });
}

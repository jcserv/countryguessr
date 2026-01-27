import type { CountryFeature } from "@/types/country";

import { COUNTRY_ALIASES } from "./countryAliases";

/**
 * Transliterate accented characters to their ASCII equivalents
 * Converts characters like ô, é, ç, etc. to o, e, c, etc.
 */
function transliterateToAscii(text: string): string {
  return text
    .normalize("NFD") // Decompose characters (e.g., ô → o + ̂)
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/ç/g, "c")
    .replace(/ñ/g, "n")
    .replace(/ß/g, "ss");
}

/**
 * Normalize a country name for comparison
 * Transliterates accented characters to ASCII, converts to lowercase,
 * removes special characters, and normalizes whitespace
 */
export function normalizeCountryName(name: string): string {
  return transliterateToAscii(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, "") // Remove special characters
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Find a country by name (supports primary name and aliases)
 */
export function findCountryByName(
  input: string,
  countries: CountryFeature[],
): CountryFeature | null {
  const normalized = normalizeCountryName(input);

  return (
    countries.find((country) => {
      const code = country.properties.ISO_A2;
      const primaryName = normalizeCountryName(country.properties.NAME);
      const longName = normalizeCountryName(country.properties.NAME_LONG);
      const aliases = COUNTRY_ALIASES[code] || [];

      // Check primary name, long name, and aliases
      return (
        primaryName === normalized ||
        longName === normalized ||
        aliases.some((alias) => normalizeCountryName(alias) === normalized)
      );
    }) || null
  );
}

/**
 * Get all possible names for a country (for autocomplete)
 */
export function getCountryDisplayNames(country: CountryFeature): string[] {
  const names = [country.properties.NAME];
  const code = country.properties.ISO_A2;
  const aliases = COUNTRY_ALIASES[code] || [];

  // Add unique aliases
  aliases.forEach((alias) => {
    const capitalizedAlias = alias
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    if (!names.includes(capitalizedAlias)) {
      names.push(capitalizedAlias);
    }
  });

  return names;
}

/**
 * Filter countries by search query
 */
export function filterCountries(
  query: string,
  countries: CountryFeature[],
): CountryFeature[] {
  if (!query.trim()) {
    return countries;
  }

  const normalized = normalizeCountryName(query);

  return countries.filter((country) => {
    const code = country.properties.ISO_A2;
    const primaryName = normalizeCountryName(country.properties.NAME);
    const longName = normalizeCountryName(country.properties.NAME_LONG);
    const aliases = COUNTRY_ALIASES[code] || [];

    // Check if query matches any part of any name or alias
    return (
      primaryName.includes(normalized) ||
      longName.includes(normalized) ||
      aliases.some((alias) => normalizeCountryName(alias).includes(normalized))
    );
  });
}

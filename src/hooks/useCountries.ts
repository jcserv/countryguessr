import { useEffect, useState } from "react";

import type { CountriesGeoJSON, CountryFeature } from "@/types/country";

interface UseCountriesResult {
  countries: CountryFeature[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to load countries GeoJSON data.
 * Centralizes the fetch logic used by both GameContext and useCompetitiveGame.
 */
export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/countries.geojson")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load countries data");
        }
        return res.json();
      })
      .then((data: CountriesGeoJSON) => {
        setCountries(data.features);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error loading countries:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });
  }, []);

  return { countries, loading, error };
}

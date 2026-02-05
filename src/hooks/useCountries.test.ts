import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountries } from "./useCountries";

describe("useCountries", () => {
  const mockGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          NAME: "United States",
          NAME_LONG: "United States of America",
          ISO_A2: "US",
          REGION_UN: "Americas",
          SUBREGION: "Northern America",
        },
        geometry: { type: "Polygon", coordinates: [] },
      },
      {
        type: "Feature",
        properties: {
          NAME: "France",
          NAME_LONG: "French Republic",
          ISO_A2: "FR",
          REGION_UN: "Europe",
          SUBREGION: "Western Europe",
        },
        geometry: { type: "Polygon", coordinates: [] },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with loading state", () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves
        }),
    );

    const { result } = renderHook(() => useCountries());

    expect(result.current.loading).toBe(true);
    expect(result.current.countries).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("loads countries successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    });

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.countries).toHaveLength(2);
    expect(result.current.countries[0].properties.ISO_A2).toBe("US");
    expect(result.current.countries[1].properties.ISO_A2).toBe("FR");
    expect(result.current.error).toBeNull();
  });

  it("handles fetch network error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.countries).toEqual([]);
    expect(result.current.error).toBe("Network error");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("handles non-ok response", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.countries).toEqual([]);
    expect(result.current.error).toBe("Failed to load countries data");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("handles non-Error thrown values", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue("string error");

    const { result } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.countries).toEqual([]);
    expect(result.current.error).toBe("Unknown error");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("only fetches once on mount", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    });

    const { result, rerender } = renderHook(() => useCountries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Rerender should not trigger another fetch
    rerender();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

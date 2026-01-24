import React from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CountriesGeoJSON } from "@/types/country";
import { GAME_CONFIG } from "@/types/game";

import { GameProvider, useGameContext } from "./GameContext";

// Mock country data
const mockCountriesData: CountriesGeoJSON = {
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
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-100, 40],
            [-90, 40],
            [-90, 50],
            [-100, 50],
            [-100, 40],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        NAME: "Canada",
        NAME_LONG: "Canada",
        ISO_A2: "CA",
        REGION_UN: "Americas",
        SUBREGION: "Northern America",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-100, 50],
            [-90, 50],
            [-90, 60],
            [-100, 60],
            [-100, 50],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        NAME: "Mexico",
        NAME_LONG: "Mexico",
        ISO_A2: "MX",
        REGION_UN: "Americas",
        SUBREGION: "Central America",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-100, 20],
            [-90, 20],
            [-90, 30],
            [-100, 30],
            [-100, 20],
          ],
        ],
      },
    },
  ],
};

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockCountriesData),
  } as Response),
);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

describe("GameContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("initial state", () => {
    it("starts with idle status", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.gameStatus).toBe("idle");
    });

    it("starts with 3 lives", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.livesRemaining).toBe(GAME_CONFIG.INITIAL_LIVES);
    });

    it("starts with 30 minutes time", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.timeRemaining).toBe(
        GAME_CONFIG.INITIAL_TIME_SECONDS,
      );
    });

    it("loads countries from API", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.countries).toHaveLength(3);
    });
  });

  describe("startGame", () => {
    it("resets state and sets playing status", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      expect(result.current.gameStatus).toBe("playing");
      expect(result.current.guessedCountries.size).toBe(0);
      expect(result.current.livesRemaining).toBe(GAME_CONFIG.INITIAL_LIVES);
      expect(result.current.timeRemaining).toBe(
        GAME_CONFIG.INITIAL_TIME_SECONDS,
      );
    });
  });

  describe("submitGuess", () => {
    it("adds country to guessed set on correct guess", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.selectCountry("US");
      });

      let isCorrect: boolean;
      act(() => {
        isCorrect = result.current.submitGuess("US");
      });

      expect(isCorrect!).toBe(true);
      expect(result.current.guessedCountries.has("US")).toBe(true);
      // Selected country stays on the guessed country to support keyboard navigation
      expect(result.current.selectedCountry).toBe("US");
    });

    it("decreases lives on incorrect guess", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.selectCountry("US");
      });

      let isCorrect: boolean;
      act(() => {
        isCorrect = result.current.submitGuess("CA"); // Wrong guess
      });

      expect(isCorrect!).toBe(false);
      expect(result.current.livesRemaining).toBe(GAME_CONFIG.INITIAL_LIVES - 1);
    });

    it("returns false when no country selected", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      let isCorrect: boolean;
      act(() => {
        isCorrect = result.current.submitGuess("US");
      });

      expect(isCorrect!).toBe(false);
    });

    it("returns false when not playing", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Don't start the game
      let isCorrect: boolean;
      act(() => {
        isCorrect = result.current.submitGuess("US");
      });

      expect(isCorrect!).toBe(false);
    });
  });

  describe("selectCountry", () => {
    it("only allows selection when playing", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Game not started
      act(() => {
        result.current.selectCountry("US");
      });

      expect(result.current.selectedCountry).toBeNull();
    });

    it("allows selection when playing", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.selectCountry("US");
      });

      expect(result.current.selectedCountry).toBe("US");
    });

    it("does not allow selection of already guessed country", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      // Guess US correctly
      act(() => {
        result.current.selectCountry("US");
      });
      act(() => {
        result.current.submitGuess("US");
      });

      // Select a different country first
      act(() => {
        result.current.selectCountry("CA");
      });
      expect(result.current.selectedCountry).toBe("CA");

      // Try to select US again (already guessed) - should not change selection
      act(() => {
        result.current.selectCountry("US");
      });

      expect(result.current.selectedCountry).toBe("CA");
    });
  });

  describe("pause/resume", () => {
    it("pauses game from playing state", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      expect(result.current.gameStatus).toBe("playing");

      act(() => {
        result.current.pauseGame();
      });

      expect(result.current.gameStatus).toBe("paused");
    });

    it("resumes game from paused state", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.pauseGame();
      });

      act(() => {
        result.current.resumeGame();
      });

      expect(result.current.gameStatus).toBe("playing");
    });

    it("does not pause when not playing", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.pauseGame();
      });

      expect(result.current.gameStatus).toBe("idle");
    });

    it("does not resume when not paused", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.resumeGame();
      });

      expect(result.current.gameStatus).toBe("playing");
    });
  });

  describe("endGame", () => {
    it("sets lost status and saves to history", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.endGame();
      });

      expect(result.current.gameStatus).toBe("lost");
    });
  });

  describe("win condition", () => {
    it("triggers won status when all countries guessed", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      // Guess all countries
      const countries = ["US", "CA", "MX"];
      for (const code of countries) {
        act(() => {
          result.current.selectCountry(code);
        });
        act(() => {
          result.current.submitGuess(code);
        });
      }

      expect(result.current.gameStatus).toBe("won");
    });
  });

  describe("time up", () => {
    it("triggers lost when time reaches 0", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      // Manually set time to 0
      act(() => {
        result.current.setTimeRemaining(0);
      });

      expect(result.current.gameStatus).toBe("lost");
    });
  });

  describe("resetGame", () => {
    it("resets to idle state", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.selectCountry("US");
      });

      act(() => {
        result.current.submitGuess("CA"); // Lose a life
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameStatus).toBe("idle");
      expect(result.current.guessedCountries.size).toBe(0);
      expect(result.current.livesRemaining).toBe(GAME_CONFIG.INITIAL_LIVES);
      expect(result.current.timeRemaining).toBe(
        GAME_CONFIG.INITIAL_TIME_SECONDS,
      );
      expect(result.current.selectedCountry).toBeNull();
    });
  });

  describe("computed values", () => {
    it("calculates correctGuesses correctly", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      expect(result.current.correctGuesses).toBe(0);

      act(() => {
        result.current.selectCountry("US");
      });
      act(() => {
        result.current.submitGuess("US");
      });

      expect(result.current.correctGuesses).toBe(1);
    });

    it("calculates remainingCountries correctly", async () => {
      const { result } = renderHook(() => useGameContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startGame();
      });

      expect(result.current.remainingCountries).toBe(3);

      act(() => {
        result.current.selectCountry("US");
      });
      act(() => {
        result.current.submitGuess("US");
      });

      expect(result.current.remainingCountries).toBe(2);
    });
  });

  describe("error handling", () => {
    it("throws error when used outside provider", () => {
      expect(() => {
        renderHook(() => useGameContext());
      }).toThrow("useGameContext must be used within a GameProvider");
    });
  });
});

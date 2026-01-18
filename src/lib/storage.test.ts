import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CompletedGame, StoredGameState } from "@/types/game";
import { STORAGE_KEYS } from "@/types/game";

import {
  clearAllGameData,
  clearCurrentGame,
  clearGameHistory,
  loadCurrentGame,
  loadGameHistory,
  saveCompletedGame,
  saveCurrentGame,
} from "./storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveCurrentGame", () => {
    it("saves game state correctly", () => {
      const state: StoredGameState = {
        version: 1,
        status: "playing",
        guessedCountryCodes: ["US", "GB"],
        livesRemaining: 2,
        timeRemaining: 1500,
        startedAt: Date.now(),
        wrongGuesses: [{ guessedCode: "CA", actualCode: "US" }],
      };

      saveCurrentGame(state);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(state),
      );
    });

    it("handles localStorage errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
        throw new Error("Storage quota exceeded");
      });

      const state: StoredGameState = {
        version: 1,
        status: "playing",
        guessedCountryCodes: [],
        livesRemaining: 3,
        timeRemaining: 1800,
        startedAt: Date.now(),
        wrongGuesses: [],
      };

      // Should not throw
      expect(() => saveCurrentGame(state)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("loadCurrentGame", () => {
    it("returns null when empty", () => {
      const result = loadCurrentGame();
      expect(result).toBeNull();
    });

    it("returns stored game state when valid", () => {
      const state: StoredGameState = {
        version: 1,
        status: "playing",
        guessedCountryCodes: ["US"],
        livesRemaining: 3,
        timeRemaining: 1000,
        startedAt: Date.now(),
        wrongGuesses: [],
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(state));

      const result = loadCurrentGame();
      expect(result).toEqual(state);
    });

    it("returns null and clears for unknown version", () => {
      const invalidState = { version: 999, data: "test" };
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(invalidState),
      );

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = loadCurrentGame();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME,
      );
      consoleSpy.mockRestore();
    });

    it("handles parse errors gracefully", () => {
      localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, "invalid json {{{");
      vi.mocked(localStorage.getItem).mockReturnValueOnce("invalid json {{{");

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = loadCurrentGame();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("clearCurrentGame", () => {
    it("removes the current game from localStorage", () => {
      clearCurrentGame();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME,
      );
    });
  });

  describe("saveCompletedGame", () => {
    it("appends game to history", () => {
      const game: CompletedGame = {
        completedAt: Date.now(),
        result: "won",
        correctGuesses: 178,
        totalCountries: 178,
        timeElapsed: 1500,
        livesRemaining: 2,
        guessedCountryCodes: ["US", "GB"],
        wrongGuesses: [],
      };

      saveCompletedGame(game);

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GAME_HISTORY) || "{}",
      );
      expect(stored.version).toBe(2);
      expect(stored.games).toHaveLength(1);
      expect(stored.games[0]).toEqual(game);
    });

    it("appends to existing history", () => {
      const existingHistory = {
        version: 2,
        games: [
          {
            completedAt: Date.now() - 10000,
            result: "lost",
            correctGuesses: 50,
            totalCountries: 178,
            timeElapsed: 1800,
            livesRemaining: 0,
            guessedCountryCodes: [],
            wrongGuesses: [],
          },
        ],
      };
      localStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(existingHistory),
      );

      const newGame: CompletedGame = {
        completedAt: Date.now(),
        result: "won",
        correctGuesses: 178,
        totalCountries: 178,
        timeElapsed: 1000,
        livesRemaining: 3,
        guessedCountryCodes: ["US"],
        wrongGuesses: [],
      };

      saveCompletedGame(newGame);

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GAME_HISTORY) || "{}",
      );
      expect(stored.games).toHaveLength(2);
    });
  });

  describe("loadGameHistory", () => {
    it("returns empty history when no data exists", () => {
      const result = loadGameHistory();
      expect(result).toEqual({ version: 2, games: [] });
    });

    it("migrates v1 to v2 format", () => {
      const v1History = {
        version: 1,
        games: [
          {
            completedAt: Date.now(),
            result: "won",
            correctGuesses: 100,
            totalCountries: 178,
            timeElapsed: 1200,
            livesRemaining: 1,
          },
        ],
      };
      localStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(v1History),
      );

      const result = loadGameHistory();

      expect(result.version).toBe(2);
      expect(result.games[0]).toHaveProperty("guessedCountryCodes");
      expect(result.games[0]).toHaveProperty("wrongGuesses");
      expect(result.games[0].guessedCountryCodes).toEqual([]);
      expect(result.games[0].wrongGuesses).toEqual([]);
    });

    it("returns empty for unknown versions", () => {
      const unknownVersion = { version: 999, games: [] };
      localStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(unknownVersion),
      );

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = loadGameHistory();

      expect(result).toEqual({ version: 2, games: [] });
      consoleSpy.mockRestore();
    });

    it("handles parse errors gracefully", () => {
      vi.mocked(localStorage.getItem).mockReturnValueOnce("invalid json");

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = loadGameHistory();

      expect(result).toEqual({ version: 2, games: [] });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("clearGameHistory", () => {
    it("removes game history from localStorage", () => {
      clearGameHistory();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY,
      );
    });
  });

  describe("clearAllGameData", () => {
    it("removes both current game and history", () => {
      clearAllGameData();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME,
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY,
      );
    });
  });
});

/* eslint-disable no-console */
import type {
  CompletedGame,
  CompletedGameV1,
  GameHistory,
  GameHistoryV1,
  StoredGameState,
} from "@/types/game";
import { STORAGE_KEYS } from "@/types/game";

/**
 * Saves the current game state to localStorage
 */
export function saveCurrentGame(state: StoredGameState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save current game:", error);
  }
}

/**
 * Loads the current game state from localStorage
 */
export function loadCurrentGame(): StoredGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredGameState;

    // Validate version
    if (parsed.version !== 1) {
      console.warn("Unknown game state version, clearing");
      clearCurrentGame();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load current game:", error);
    return null;
  }
}

/**
 * Clears the current game from localStorage
 */
export function clearCurrentGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch (error) {
    console.error("Failed to clear current game:", error);
  }
}

/**
 * Saves a completed game to history
 */
export function saveCompletedGame(game: CompletedGame): void {
  try {
    const history = loadGameHistory();
    history.games.push(game);
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save completed game:", error);
  }
}

/**
 * Migrates a v1 completed game to v2 format
 */
function migrateGameV1ToV2(game: CompletedGameV1): CompletedGame {
  return {
    ...game,
    guessedCountryCodes: [],
    wrongGuesses: [],
  };
}

/**
 * Loads game history from localStorage
 */
export function loadGameHistory(): GameHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!stored) {
      return { version: 2, games: [] };
    }

    const parsed = JSON.parse(stored);

    // Handle v1 migration
    if (parsed.version === 1) {
      const v1History = parsed as GameHistoryV1;
      const migratedGames = v1History.games.map(migrateGameV1ToV2);
      const v2History: GameHistory = { version: 2, games: migratedGames };
      // Save migrated history
      localStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(v2History),
      );
      return v2History;
    }

    // Validate version
    if (parsed.version !== 2) {
      console.warn("Unknown game history version, resetting");
      return { version: 2, games: [] };
    }

    return parsed as GameHistory;
  } catch (error) {
    console.error("Failed to load game history:", error);
    return { version: 2, games: [] };
  }
}

/**
 * Clears game history from localStorage
 */
export function clearGameHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
  } catch (error) {
    console.error("Failed to clear game history:", error);
  }
}

/**
 * Clears all game data from localStorage
 */
export function clearAllGameData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
  } catch (error) {
    console.error("Failed to clear game data:", error);
  }
}

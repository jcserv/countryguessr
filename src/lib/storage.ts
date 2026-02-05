/* eslint-disable no-console */
import { COMPETITIVE_STORAGE_KEYS } from "@/types/competitive";
import type {
  CompletedGame,
  CompletedGameV1,
  CompletedGameV2,
  GameHistory,
  GameHistoryV1,
  GameHistoryV2,
  StoredGameState,
  StoredGameStateV1,
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
 * Migrates a v1 game state to v2 format
 */
function migrateGameStateV1ToV2(state: StoredGameStateV1): StoredGameState {
  return {
    ...state,
    version: 2,
    savedAt: Date.now(),
  };
}

/**
 * Loads the current game state from localStorage
 */
export function loadCurrentGame(): StoredGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Handle v1 migration
    if (parsed.version === 1) {
      const v1State = parsed as StoredGameStateV1;
      const v2State = migrateGameStateV1ToV2(v1State);
      // Save migrated state
      saveCurrentGame(v2State);
      return v2State;
    }

    // Validate version
    if (parsed.version !== 2) {
      console.warn("Unknown game state version, clearing");
      clearCurrentGame();
      return null;
    }

    return parsed as StoredGameState;
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
 * Migrates a v1 completed game to v3 format
 */
function migrateGameV1ToV3(game: CompletedGameV1): CompletedGame {
  return {
    ...game,
    mode: "solo" as const,
    guessedCountryCodes: [],
    wrongGuesses: [],
  };
}

/**
 * Migrates a v2 completed game to v3 format
 */
function migrateGameV2ToV3(game: CompletedGameV2): CompletedGame {
  return {
    ...game,
    mode: "solo" as const,
  };
}

/**
 * Loads game history from localStorage
 */
export function loadGameHistory(): GameHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!stored) {
      return { version: 3, games: [] };
    }

    const parsed = JSON.parse(stored);

    // Handle v1 migration
    if (parsed.version === 1) {
      const v1History = parsed as GameHistoryV1;
      const migratedGames = v1History.games.map(migrateGameV1ToV3);
      const v3History: GameHistory = { version: 3, games: migratedGames };
      // Save migrated history
      localStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(v3History),
      );
      return v3History;
    }

    // Handle v2 migration
    if (parsed.version === 2) {
      const v2History = parsed as GameHistoryV2;
      const migratedGames = v2History.games.map(migrateGameV2ToV3);
      const v3History: GameHistory = { version: 3, games: migratedGames };
      // Save migrated history
      localStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(v3History),
      );
      return v3History;
    }

    // Validate version
    if (parsed.version !== 3) {
      console.warn("Unknown game history version, resetting");
      return { version: 3, games: [] };
    }

    return parsed as GameHistory;
  } catch (error) {
    console.error("Failed to load game history:", error);
    return { version: 3, games: [] };
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

// =============================================================================
// Competitive Mode Storage
// =============================================================================

/**
 * Generate a unique player ID for competitive mode
 */
function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create a persistent player ID for competitive mode
 */
export function getPlayerId(): string {
  try {
    const stored = localStorage.getItem(COMPETITIVE_STORAGE_KEYS.PLAYER_ID);
    if (stored) return stored;

    const newId = generatePlayerId();
    localStorage.setItem(COMPETITIVE_STORAGE_KEYS.PLAYER_ID, newId);
    return newId;
  } catch (error) {
    console.error("Failed to get/create player ID:", error);
    return generatePlayerId();
  }
}

/**
 * Save the player's nickname for competitive mode
 */
export function saveNickname(nickname: string): void {
  try {
    localStorage.setItem(COMPETITIVE_STORAGE_KEYS.NICKNAME, nickname);
  } catch (error) {
    console.error("Failed to save nickname:", error);
  }
}

/**
 * Load the player's saved nickname
 */
export function loadNickname(): string | null {
  try {
    return localStorage.getItem(COMPETITIVE_STORAGE_KEYS.NICKNAME);
  } catch (error) {
    console.error("Failed to load nickname:", error);
    return null;
  }
}

/**
 * Centralized constants for the application.
 * Eliminates magic numbers scattered throughout the codebase.
 */

// Game configuration
export const GAME_CONFIG = {
  /** Number of lives at game start */
  INITIAL_LIVES: 3,
  /** Game duration in seconds (30 minutes) */
  INITIAL_TIME_SECONDS: 30 * 60,
  /** Total number of countries in the game */
  TOTAL_COUNTRIES: 178,
} as const;

// Map configuration
export const MAP_CONFIG = {
  /** Default map center coordinates [lat, lng] */
  DEFAULT_CENTER: [20, 0] as [number, number],
  /** Default zoom level */
  DEFAULT_ZOOM: 2,
  /** Minimum zoom level */
  MIN_ZOOM: 1,
  /** Maximum zoom level */
  MAX_ZOOM: 18,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_GAME: "countryguessr_current_game",
  GAME_HISTORY: "countryguessr_game_history",
  PLAYER_ID: "countryguessr_competitive_player_id",
  NICKNAME: "countryguessr_competitive_nickname",
} as const;

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  /** Reconnect delay in milliseconds */
  RECONNECT_DELAY_MS: 1000,
  /** Maximum reconnect attempts */
  MAX_RECONNECT_ATTEMPTS: 10,
} as const;

// Timer configuration
export const TIMER_CONFIG = {
  /** Warning threshold in seconds (5 minutes) */
  WARNING_THRESHOLD_SECONDS: 5 * 60,
  /** Critical threshold in seconds (1 minute) */
  CRITICAL_THRESHOLD_SECONDS: 60,
} as const;

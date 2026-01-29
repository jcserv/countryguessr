// Game status states
export type GameStatus = "idle" | "playing" | "paused" | "won" | "lost";

// Game regions for progress tracking
export type GameRegion =
  | "Europe"
  | "Americas"
  | "Africa"
  | "Middle East & Central Asia"
  | "Asia & Oceania";

export const GAME_REGIONS: GameRegion[] = [
  "Europe",
  "Americas",
  "Africa",
  "Middle East & Central Asia",
  "Asia & Oceania",
];

// Region progress tracking
export interface RegionProgress {
  region: GameRegion;
  guessed: number;
  total: number;
  percentage: number;
}

// Game configuration
export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  INITIAL_TIME_SECONDS: 30 * 60, // 30 minutes
} as const;

// Wrong guess tracking
export interface WrongGuess {
  guessedCode: string; // What user guessed
  actualCode: string; // What the correct answer was
}

// localStorage schema for v1 (legacy)
export interface StoredGameStateV1 {
  version: 1;
  status: "playing";
  guessedCountryCodes: string[];
  livesRemaining: number;
  timeRemaining: number;
  startedAt: number;
  wrongGuesses: WrongGuess[];
}

// localStorage schema for v2 (current)
export interface StoredGameState {
  version: 2;
  status: "playing";
  guessedCountryCodes: string[];
  livesRemaining: number;
  timeRemaining: number;
  startedAt: number;
  savedAt: number;
  wrongGuesses: WrongGuess[];
}

// V1 completed game (legacy)
export interface CompletedGameV1 {
  completedAt: number;
  result: "won" | "lost";
  correctGuesses: number;
  totalCountries: number;
  timeElapsed: number;
  livesRemaining: number;
}

// V2 completed game with detailed data
export interface CompletedGame {
  completedAt: number;
  result: "won" | "lost";
  correctGuesses: number;
  totalCountries: number;
  timeElapsed: number;
  livesRemaining: number;
  // New fields for expanded view
  guessedCountryCodes: string[];
  wrongGuesses: WrongGuess[];
}

export interface GameHistoryV1 {
  version: 1;
  games: CompletedGameV1[];
}

export interface GameHistory {
  version: 2;
  games: CompletedGame[];
}

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_GAME: "countryguessr_current_game",
  GAME_HISTORY: "countryguessr_game_history",
} as const;

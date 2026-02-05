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

// Re-export from centralized constants
export { GAME_CONFIG, STORAGE_KEYS } from "@/lib/constants";

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

// V2 completed game with detailed data (legacy, now migrated to V3)
export interface CompletedGameV2 {
  completedAt: number;
  result: "won" | "lost";
  correctGuesses: number;
  totalCountries: number;
  timeElapsed: number;
  livesRemaining: number;
  guessedCountryCodes: string[];
  wrongGuesses: WrongGuess[];
}

// V3 completed game with mode support
export interface CompletedGame {
  // All modes
  completedAt: number;
  result: "won" | "lost";
  correctGuesses: number;
  totalCountries: number;
  timeElapsed: number;
  guessedCountryCodes: string[];

  // Mode discriminator
  mode: "solo" | "competitive";

  // Solo-only fields (optional for competitive)
  livesRemaining?: number;
  wrongGuesses?: WrongGuess[];

  // Competitive-only fields (optional for solo)
  gameId?: string;
  myPlayerId?: string;
  myNickname?: string;
  playerCount?: number;
  rankings?: Array<{
    playerId: string;
    nickname: string;
    claimedCount: number;
    isMe: boolean;
  }>;
}

export interface GameHistoryV1 {
  version: 1;
  games: CompletedGameV1[];
}

export interface GameHistoryV2 {
  version: 2;
  games: CompletedGameV2[];
}

export interface GameHistory {
  version: 3;
  games: CompletedGame[];
}

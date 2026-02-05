import type { CountryCentroids } from "@/lib/countryNavigation";

import type { CountryFeature } from "./country";
import type { RegionProgress } from "./game";

// Unified game mode
export type UnifiedGameMode = "solo" | "competitive";

// Unified status that covers both modes
export type UnifiedGameStatus =
  | "idle"
  | "lobby"
  | "playing"
  | "paused"
  | "won"
  | "lost"
  | "finished";

// Player progress for rankings in competitive mode
export interface PlayerProgress {
  playerId: string;
  nickname: string;
  claimedCount: number;
  color: string;
  isMe: boolean;
  isConnected: boolean;
}

// Country owner info for competitive mode
export interface CountryOwner {
  id: string;
  color: string;
  name: string;
}

// Unified game state interface that normalizes both solo and competitive modes
export interface UnifiedGameState {
  mode: UnifiedGameMode;
  status: UnifiedGameStatus;
  timeRemaining: number | null;
  livesRemaining?: number; // Solo only

  countries: CountryFeature[];
  countryCentroids: CountryCentroids;
  loading: boolean;
  selectedCountry: string | null;

  // Set of unavailable country codes (guessed in solo, claimed in competitive)
  unavailableCountries: Set<string>;

  myProgress: {
    claimedCount: number;
    remainingCount: number;
    totalCount: number;
  };

  regionProgress?: RegionProgress[]; // Solo only
  playerRankings?: PlayerProgress[]; // Competitive only

  // Competitive-specific state
  isHost?: boolean;
  gameId?: string;
}

// Result from submitting a guess
export interface GuessResult {
  success: boolean;
  error?: string;
}

// Unified game actions interface
export interface UnifiedGameActions {
  selectCountry: (code: string | null) => void;
  submitGuess: (code: string) => Promise<GuessResult>;
  startGame: () => void | Promise<void>;
  pauseGame?: () => void; // Solo only
  resumeGame?: () => void; // Solo only
  endGame?: () => void | Promise<void>; // Solo and Competitive (host only)
  leaveGame?: () => void; // Competitive only
  isCountryAvailable: (code: string) => boolean;
  getCountryOwner: (code: string) => CountryOwner | null;
}

// Combined interface returned by useUnifiedGame
export interface UnifiedGame extends UnifiedGameState, UnifiedGameActions {}

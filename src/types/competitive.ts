// Competitive game status states
export type CompetitiveGameStatus = "lobby" | "playing" | "finished";

// Player representation
export interface Player {
  id: string;
  nickname: string;
  claimedCountries: string[];
  isHost: boolean;
  isConnected: boolean;
  lives: number;
  isEliminated: boolean;
}

// Full competitive game state from server
export interface CompetitiveGameState {
  gameId: string;
  status: CompetitiveGameStatus;
  hostId: string;
  players: Map<string, Player>;
  claimedCountries: Map<string, string>; // country_code -> player_id
  startedAt: number | null;
  endedAt: number | null;
  timeRemaining: number | null;
}

// Server event payloads
export interface GameStatePayload {
  game_id: string;
  status: CompetitiveGameStatus;
  host_id: string;
  players: Record<
    string,
    {
      id: string;
      nickname: string;
      claimed_countries: string[];
      is_host: boolean;
      is_connected: boolean;
      lives: number;
      is_eliminated: boolean;
    }
  >;
  claimed_countries: Record<string, string>;
  started_at: number | null;
  ended_at: number | null;
  time_remaining: number | null;
}

export interface PlayerJoinedPayload {
  player_id: string;
  nickname: string;
  is_host: boolean;
}

export interface PlayerLeftPayload {
  player_id: string;
}

export interface CountryClaimedPayload {
  player_id: string;
  country_code: string;
}

export interface GameStartedPayload {
  started_at: number;
}

export interface GameEndedPayload {
  ended_at: number;
  winner_id: string | null;
  rankings: Array<{
    player_id: string;
    nickname: string;
    claimed_count: number;
    lives_remaining: number;
    is_eliminated: boolean;
  }>;
}

export interface TimerTickPayload {
  time_remaining: number;
}

export interface LifeLostPayload {
  player_id: string;
  lives_remaining: number;
}

export interface PlayerEliminatedPayload {
  player_id: string;
}

export interface SubmitGuessResponse {
  correct: boolean;
  success?: boolean;
  lives?: number;
  is_eliminated?: boolean;
  error?: string;
}

// Channel response types
export interface JoinResponse {
  game_id: string;
  player_id: string;
}

export interface CreateRoomResponse {
  game_id: string;
}

export interface ClaimCountryResponse {
  success: boolean;
  error?: string;
}

// Competitive storage keys
export const COMPETITIVE_STORAGE_KEYS = {
  PLAYER_ID: "countryguessr_competitive_player_id",
  NICKNAME: "countryguessr_competitive_nickname",
} as const;

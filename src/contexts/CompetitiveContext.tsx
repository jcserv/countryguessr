import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCompetitiveTimer } from "@/contexts/CompetitiveTimerContext";
import { useChannel } from "@/hooks/useChannel";
import { useSocket } from "@/hooks/useSocket";
import { createPlayerColorMap, type PlayerColor } from "@/lib/playerColors";
import {
  CountryClaimedPayloadSchema,
  GameEndedPayloadSchema,
  GameStartedPayloadSchema,
  GameStatePayloadSchema,
  PlayerJoinedPayloadSchema,
  PlayerLeftPayloadSchema,
  safeParsePayload,
  TimerTickPayloadSchema,
} from "@/lib/schemas";
import type {
  ClaimCountryResponse,
  CompetitiveGameState,
  CompetitiveGameStatus,
  GameEndedPayload,
  GameStatePayload,
  Player,
} from "@/types/competitive";
import type { UnifiedGameStatus } from "@/types/unified-game";

interface CompetitiveContextValue {
  // Connection state
  gameId: string | null;
  joined: boolean;
  error: unknown;

  // Game state
  gameState: CompetitiveGameState | null;
  players: Player[];
  playerColors: Map<string, PlayerColor>;
  isHost: boolean;
  myClaimedCountries: string[];
  rankings: GameEndedPayload["rankings"] | null;

  // Actions
  leaveGame: () => void;
  startGame: () => Promise<void>;
  claimCountry: (countryCode: string) => Promise<ClaimCountryResponse>;
}

export const CompetitiveContext = createContext<CompetitiveContextValue | null>(
  null,
);

interface CompetitiveProviderProps {
  children: React.ReactNode;
  gameId: string;
  nickname: string;
}

export function CompetitiveProvider({
  children,
  gameId,
  nickname,
}: CompetitiveProviderProps) {
  const { playerId } = useSocket();
  const { setTimerState, clearTimerState } = useCompetitiveTimer();
  const [gameState, setGameState] = useState<CompetitiveGameState | null>(null);
  const [rankings, setRankings] = useState<GameEndedPayload["rankings"] | null>(
    null,
  );

  // Parse server payload to client game state
  const parseGameState = useCallback(
    (payload: GameStatePayload): CompetitiveGameState => {
      const players = new Map<string, Player>();
      Object.entries(payload.players).forEach(([id, p]) => {
        players.set(id, {
          id: p.id,
          nickname: p.nickname,
          claimedCountries: p.claimed_countries,
          isHost: p.is_host,
          isConnected: p.is_connected,
        });
      });

      const claimedCountries = new Map<string, string>();
      Object.entries(payload.claimed_countries).forEach(
        ([countryCode, pId]) => {
          claimedCountries.set(countryCode, pId);
        },
      );

      return {
        gameId: payload.game_id,
        status: payload.status,
        hostId: payload.host_id,
        players,
        claimedCountries,
        startedAt: payload.started_at,
        endedAt: payload.ended_at,
        timeRemaining: payload.time_remaining,
      };
    },
    [],
  );

  // Channel callbacks
  const handleJoin = useCallback(
    (response: unknown) => {
      // Backend returns full game state on join
      if (
        response &&
        typeof response === "object" &&
        "players" in (response as object)
      ) {
        const payload = response as GameStatePayload;
        setGameState(parseGameState(payload));
      }
    },
    [parseGameState],
  );

  const { channel, joined, error, push, leave } = useChannel({
    topic: `game:${gameId}`,
    params: { nickname, player_id: playerId },
    onJoin: handleJoin,
  });

  // Set up event listeners
  useEffect(() => {
    if (!channel) return;

    // Full state sync
    channel.on("game_state", (payload) => {
      const data = safeParsePayload(
        GameStatePayloadSchema,
        payload,
        "game_state",
      );
      if (data) {
        setGameState(parseGameState(data as GameStatePayload));
      }
    });

    // Player joined
    channel.on("player_joined", (payload) => {
      const data = safeParsePayload(
        PlayerJoinedPayloadSchema,
        payload,
        "player_joined",
      );
      if (!data) return;
      setGameState((prev) => {
        if (!prev) return prev;
        const newPlayers = new Map(prev.players);
        newPlayers.set(data.player_id, {
          id: data.player_id,
          nickname: data.nickname,
          claimedCountries: [],
          isHost: data.is_host,
          isConnected: true,
        });
        return { ...prev, players: newPlayers };
      });
    });

    // Player left
    channel.on("player_left", (payload) => {
      const data = safeParsePayload(
        PlayerLeftPayloadSchema,
        payload,
        "player_left",
      );
      if (!data) return;
      setGameState((prev) => {
        if (!prev) return prev;
        const player = prev.players.get(data.player_id);
        if (player) {
          const newPlayers = new Map(prev.players);
          newPlayers.set(data.player_id, {
            ...player,
            isConnected: false,
          });
          return { ...prev, players: newPlayers };
        }
        return prev;
      });
    });

    // Country claimed
    channel.on("country_claimed", (payload) => {
      const data = safeParsePayload(
        CountryClaimedPayloadSchema,
        payload,
        "country_claimed",
      );
      if (!data) return;
      setGameState((prev) => {
        if (!prev) return prev;

        // Skip if country is already claimed (prevent duplicates)
        if (prev.claimedCountries.has(data.country_code)) {
          return prev;
        }

        const newClaimedCountries = new Map(prev.claimedCountries);
        newClaimedCountries.set(data.country_code, data.player_id);

        const player = prev.players.get(data.player_id);
        if (player) {
          const newPlayers = new Map(prev.players);
          newPlayers.set(data.player_id, {
            ...player,
            claimedCountries: [...player.claimedCountries, data.country_code],
          });
          return {
            ...prev,
            claimedCountries: newClaimedCountries,
            players: newPlayers,
          };
        }

        return { ...prev, claimedCountries: newClaimedCountries };
      });
    });

    // Game started
    channel.on("game_started", (payload) => {
      const data = safeParsePayload(
        GameStartedPayloadSchema,
        payload,
        "game_started",
      );
      if (!data) return;
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "playing" as CompetitiveGameStatus,
          startedAt: data.started_at,
        };
      });
    });

    // Game ended
    channel.on("game_ended", (payload) => {
      const data = safeParsePayload(
        GameEndedPayloadSchema,
        payload,
        "game_ended",
      );
      if (!data) return;
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "finished" as CompetitiveGameStatus,
          endedAt: data.ended_at,
        };
      });
      setRankings(data.rankings);
    });

    // Timer tick
    channel.on("timer_tick", (payload) => {
      const data = safeParsePayload(
        TimerTickPayloadSchema,
        payload,
        "timer_tick",
      );
      if (!data) return;
      setGameState((prev) => {
        if (!prev) return prev;
        return { ...prev, timeRemaining: data.time_remaining };
      });
    });

    return () => {
      channel.off("game_state");
      channel.off("player_joined");
      channel.off("player_left");
      channel.off("country_claimed");
      channel.off("game_started");
      channel.off("game_ended");
      channel.off("timer_tick");
    };
  }, [channel, parseGameState]);

  // Sync timer state to global context for Header access
  useEffect(() => {
    if (gameState) {
      setTimerState({
        timeRemaining: gameState.timeRemaining,
        status: gameState.status as UnifiedGameStatus,
      });
    }
    return () => {
      clearTimerState();
    };
  }, [
    gameState?.timeRemaining,
    gameState?.status,
    setTimerState,
    clearTimerState,
  ]);

  // Derived state
  const players = useMemo(() => {
    if (!gameState) return [];
    return Array.from(gameState.players.values());
  }, [gameState]);

  const playerColors = useMemo(() => {
    const playerIds = players.map((p) => p.id);
    return createPlayerColorMap(playerIds);
  }, [players]);

  const isHost = useMemo(() => {
    return gameState?.hostId === playerId;
  }, [gameState, playerId]);

  const myClaimedCountries = useMemo(() => {
    const me = gameState?.players.get(playerId);
    return me?.claimedCountries ?? [];
  }, [gameState, playerId]);

  // Actions
  const leaveGame = useCallback(() => {
    leave();
    setGameState(null);
    setRankings(null);
  }, [leave]);

  const startGame = useCallback(async () => {
    await push("start_game", {});
  }, [push]);

  const claimCountry = useCallback(
    async (countryCode: string): Promise<ClaimCountryResponse> => {
      try {
        const response = await push<ClaimCountryResponse>("claim_country", {
          country_code: countryCode,
        });
        return response;
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to claim country",
        };
      }
    },
    [push],
  );

  const value: CompetitiveContextValue = useMemo(
    () => ({
      gameId,
      joined,
      error,
      gameState,
      players,
      playerColors,
      isHost,
      myClaimedCountries,
      rankings,
      leaveGame,
      startGame,
      claimCountry,
    }),
    [
      gameId,
      joined,
      error,
      gameState,
      players,
      playerColors,
      isHost,
      myClaimedCountries,
      rankings,
      leaveGame,
      startGame,
      claimCountry,
    ],
  );

  return (
    <CompetitiveContext.Provider value={value}>
      {children}
    </CompetitiveContext.Provider>
  );
}

export function useCompetitive() {
  const context = useContext(CompetitiveContext);
  if (!context) {
    throw new Error("useCompetitive must be used within a CompetitiveProvider");
  }
  return context;
}

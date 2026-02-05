import { useCallback, useMemo } from "react";

import { useCompetitive } from "@/contexts/CompetitiveContext";
import { useGameContext } from "@/contexts/GameContext";
import { useCountries } from "@/hooks/useCountries";
import { useSocket } from "@/hooks/useSocket";
import { computeAllCentroids } from "@/lib/countryNavigation";
import { calculateRegionProgress } from "@/lib/regionMapping";
import type {
  CountryOwner,
  GuessResult,
  PlayerProgress,
  UnifiedGame,
  UnifiedGameStatus,
} from "@/types/unified-game";

/**
 * Hook for solo mode - wraps useGameContext into unified interface
 */
export function useSoloGame(): UnifiedGame {
  const {
    countries,
    countryCentroids,
    loading,
    gameStatus,
    guessedCountries,
    selectedCountry,
    livesRemaining,
    timeRemaining,
    correctGuesses,
    remainingCountries,
    regionProgress,
    startGame,
    endGame,
    pauseGame,
    resumeGame,
    selectCountry,
    submitGuess: soloSubmitGuess,
  } = useGameContext();

  // Map solo game status to unified status
  const status: UnifiedGameStatus = gameStatus;

  // Wrap sync submitGuess in Promise for unified interface
  const submitGuess = useCallback(
    async (code: string): Promise<GuessResult> => {
      const success = soloSubmitGuess(code);
      return { success };
    },
    [soloSubmitGuess],
  );

  // Check if country is available (not yet guessed)
  const isCountryAvailable = useCallback(
    (code: string): boolean => {
      return !guessedCountries.has(code);
    },
    [guessedCountries],
  );

  // Solo mode doesn't have country owners
  const getCountryOwner = useCallback((): CountryOwner | null => {
    return null;
  }, []);

  // Wrap selectCountry to match unified signature
  const unifiedSelectCountry = useCallback(
    (code: string | null) => {
      if (code !== null) {
        selectCountry(code);
      }
    },
    [selectCountry],
  );

  return {
    mode: "solo",
    status,
    timeRemaining,
    livesRemaining,
    countries,
    countryCentroids,
    loading,
    selectedCountry,
    unavailableCountries: guessedCountries,
    myProgress: {
      claimedCount: correctGuesses,
      remainingCount: remainingCountries,
      totalCount: countries.length,
    },
    regionProgress,
    selectCountry: unifiedSelectCountry,
    submitGuess,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    isCountryAvailable,
    getCountryOwner,
  };
}

interface UseCompetitiveGameOptions {
  selectedCountry: string | null;
  onSelectCountry: (code: string | null) => void;
}

/**
 * Hook for competitive mode - wraps useCompetitive into unified interface
 */
export function useCompetitiveGame(
  options: UseCompetitiveGameOptions,
): UnifiedGame {
  const { selectedCountry, onSelectCountry } = options;
  const { playerId } = useSocket();
  const {
    gameId,
    gameState,
    players,
    playerColors,
    isHost,
    myClaimedCountries,
    startGame: competitiveStartGame,
    leaveGame,
    claimCountry,
    endGame: competitiveEndGame,
  } = useCompetitive();

  // Load countries for competitive mode
  const { countries, loading } = useCountries();

  // Compute centroids for keyboard navigation
  const countryCentroids = useMemo(
    () => computeAllCentroids(countries),
    [countries],
  );

  // Build set of claimed country codes
  const unavailableCountries = useMemo(() => {
    if (!gameState) return new Set<string>();
    return new Set(gameState.claimedCountries.keys());
  }, [gameState]);

  // Map competitive status to unified status
  const status: UnifiedGameStatus = gameState?.status ?? "idle";

  // Build player rankings sorted by claimed count
  const playerRankings: PlayerProgress[] = useMemo(() => {
    return players
      .map((player) => ({
        playerId: player.id,
        nickname: player.nickname,
        claimedCount: player.claimedCountries.length,
        color: playerColors.get(player.id) || "#6b7280",
        isMe: player.id === playerId,
        isConnected: player.isConnected,
      }))
      .sort((a, b) => b.claimedCount - a.claimedCount);
  }, [players, playerColors, playerId]);

  // Calculate regional progress for my claimed countries
  const regionProgress = useMemo(() => {
    const myClaimedSet = new Set(myClaimedCountries);
    return calculateRegionProgress(countries, myClaimedSet);
  }, [countries, myClaimedCountries]);

  // Wrap claimCountry to match unified interface
  const submitGuess = useCallback(
    async (code: string): Promise<GuessResult> => {
      // In competitive mode, check if the guessed country matches selection
      if (code !== selectedCountry) {
        return {
          success: false,
          error: "That's not the country you selected!",
        };
      }
      return claimCountry(code);
    },
    [claimCountry, selectedCountry],
  );

  // Check if country is available (not yet claimed by anyone)
  const isCountryAvailable = useCallback(
    (code: string): boolean => {
      if (!gameState) return true;
      return !gameState.claimedCountries.has(code);
    },
    [gameState],
  );

  // Get the owner of a claimed country
  const getCountryOwner = useCallback(
    (code: string): CountryOwner | null => {
      if (!gameState) return null;
      const ownerId = gameState.claimedCountries.get(code);
      if (!ownerId) return null;

      const owner = gameState.players.get(ownerId);
      const color = playerColors.get(ownerId) || "#6b7280";

      return {
        id: ownerId,
        color,
        name: owner?.nickname || "Unknown",
      };
    },
    [gameState, playerColors],
  );

  const totalCountries = countries.length || 178;

  return {
    mode: "competitive",
    status,
    timeRemaining: gameState?.timeRemaining ?? null,
    countries,
    countryCentroids,
    loading,
    selectedCountry,
    unavailableCountries,
    myProgress: {
      claimedCount: myClaimedCountries.length,
      remainingCount: totalCountries - (gameState?.claimedCountries.size ?? 0),
      totalCount: totalCountries,
    },
    regionProgress,
    playerRankings,
    isHost,
    gameId: gameId ?? undefined,
    selectCountry: onSelectCountry,
    submitGuess,
    startGame: competitiveStartGame,
    leaveGame,
    endGame: isHost ? competitiveEndGame : undefined,
    isCountryAvailable,
    getCountryOwner,
  };
}

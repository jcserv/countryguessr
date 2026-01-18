import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  computeAllCentroids,
  type CountryCentroids,
} from "@/lib/countryNavigation";
import { calculateRegionProgress } from "@/lib/regionMapping";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCompletedGame,
  saveCurrentGame,
} from "@/lib/storage";
import type { CountriesGeoJSON, CountryFeature } from "@/types/country";
import type {
  GameStatus,
  RegionProgress,
  StoredGameState,
  WrongGuess,
} from "@/types/game";
import { GAME_CONFIG } from "@/types/game";

interface GameContextValue {
  // Data
  countries: CountryFeature[];
  countryCentroids: CountryCentroids;
  loading: boolean;
  error: string | null;

  // Game state
  gameStatus: GameStatus;
  guessedCountries: Set<string>;
  selectedCountry: string | null;
  livesRemaining: number;
  timeRemaining: number;

  // Computed
  correctGuesses: number;
  remainingCountries: number;
  regionProgress: RegionProgress[];

  // Actions
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  selectCountry: (code: string) => void;
  selectRandomCountry: () => void;
  submitGuess: (code: string) => boolean;
  resetMapView: () => void;
  registerMapResetHandler: (handler: () => void) => void;
  resetGame: () => void;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [guessedCountries, setGuessedCountries] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New game state
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [livesRemaining, setLivesRemaining] = useState<number>(
    GAME_CONFIG.INITIAL_LIVES,
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(
    GAME_CONFIG.INITIAL_TIME_SECONDS,
  );
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState<WrongGuess[]>([]);

  // Ref to track if we've loaded from storage
  const hasLoadedFromStorage = useRef(false);

  // Ref to store the map reset handler
  const mapResetHandlerRef = useRef<(() => void) | null>(null);

  // Load GeoJSON data on mount
  // The GeoJSON is pre-processed to contain exactly 178 countries matching Elsewhere Challenge
  useEffect(() => {
    fetch("/data/countries.geojson")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load countries data");
        }
        return res.json();
      })
      .then((data: CountriesGeoJSON) => {
        // All countries are already curated - just load them directly
        setCountries(data.features);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error loading countries:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load saved game from localStorage after countries are loaded
  useEffect(() => {
    if (loading || hasLoadedFromStorage.current || countries.length === 0)
      return;

    const savedGame = loadCurrentGame();
    if (savedGame && savedGame.status === "playing") {
      setGuessedCountries(new Set(savedGame.guessedCountryCodes));
      setLivesRemaining(savedGame.livesRemaining);
      setTimeRemaining(savedGame.timeRemaining);
      setGameStartedAt(savedGame.startedAt);
      setWrongGuesses(savedGame.wrongGuesses || []);
      setGameStatus("playing");
    }
    hasLoadedFromStorage.current = true;
  }, [loading, countries.length]);

  // Save game state to localStorage when it changes
  useEffect(() => {
    if (gameStatus !== "playing" || !hasLoadedFromStorage.current) return;

    const state: StoredGameState = {
      version: 1,
      status: "playing",
      guessedCountryCodes: Array.from(guessedCountries),
      livesRemaining,
      timeRemaining,
      startedAt: gameStartedAt || Date.now(),
      wrongGuesses,
    };
    saveCurrentGame(state);
  }, [
    gameStatus,
    guessedCountries,
    livesRemaining,
    timeRemaining,
    gameStartedAt,
    wrongGuesses,
  ]);

  // Check for win condition
  useEffect(() => {
    if (gameStatus !== "playing" || countries.length === 0) return;

    if (guessedCountries.size === countries.length) {
      handleGameEnd("won");
    }
  }, [guessedCountries.size, countries.length, gameStatus]);

  // Check for time up
  useEffect(() => {
    if (gameStatus !== "playing") return;

    if (timeRemaining <= 0) {
      handleGameEnd("lost");
    }
  }, [timeRemaining, gameStatus]);

  const handleGameEnd = useCallback(
    (result: "won" | "lost") => {
      setGameStatus(result);
      clearCurrentGame();

      // Save to history
      const timeElapsed = gameStartedAt
        ? Math.floor((Date.now() - gameStartedAt) / 1000)
        : GAME_CONFIG.INITIAL_TIME_SECONDS - timeRemaining;

      saveCompletedGame({
        completedAt: Date.now(),
        result,
        correctGuesses: guessedCountries.size,
        totalCountries: countries.length,
        timeElapsed,
        livesRemaining,
        guessedCountryCodes: Array.from(guessedCountries),
        wrongGuesses,
      });
    },
    [
      gameStartedAt,
      timeRemaining,
      guessedCountries,
      countries.length,
      livesRemaining,
      wrongGuesses,
    ],
  );

  const startGame = useCallback(() => {
    setGuessedCountries(new Set());
    setSelectedCountry(null);
    setLivesRemaining(GAME_CONFIG.INITIAL_LIVES);
    setTimeRemaining(GAME_CONFIG.INITIAL_TIME_SECONDS);
    setGameStartedAt(Date.now());
    setWrongGuesses([]);
    setGameStatus("playing");
  }, []);

  const endGame = useCallback(() => {
    handleGameEnd("lost");
  }, [handleGameEnd]);

  const pauseGame = useCallback(() => {
    if (gameStatus === "playing") {
      setGameStatus("paused");
    }
  }, [gameStatus]);

  const resumeGame = useCallback(() => {
    if (gameStatus === "paused") {
      setGameStatus("playing");
    }
  }, [gameStatus]);

  const selectCountry = useCallback(
    (countryCode: string) => {
      if (gameStatus !== "playing") return;
      if (!guessedCountries.has(countryCode)) {
        setSelectedCountry(countryCode);
      }
    },
    [guessedCountries, gameStatus],
  );

  const selectRandomCountry = useCallback(() => {
    if (gameStatus !== "playing") return;

    const unguessedCountries = countries.filter(
      (c) => !guessedCountries.has(c.properties.ISO_A2),
    );

    if (unguessedCountries.length > 0) {
      const randomIndex = Math.floor(Math.random() * unguessedCountries.length);
      const randomCountry = unguessedCountries[randomIndex];
      setSelectedCountry(randomCountry.properties.ISO_A2);
    }
  }, [countries, guessedCountries, gameStatus]);

  const submitGuess = useCallback(
    (guessedCode: string) => {
      if (!selectedCountry || gameStatus !== "playing") {
        return false;
      }

      const isCorrect = guessedCode === selectedCountry;

      if (isCorrect) {
        setGuessedCountries((prev) => new Set([...prev, selectedCountry]));
        setSelectedCountry(null);
        return true;
      } else {
        // Wrong guess - lose a life and record the wrong guess
        setWrongGuesses((prev) => [
          ...prev,
          { guessedCode, actualCode: selectedCountry },
        ]);
        const newLives = livesRemaining - 1;
        setLivesRemaining(newLives);

        if (newLives <= 0) {
          handleGameEnd("lost");
        }
        return false;
      }
    },
    [selectedCountry, livesRemaining, gameStatus, handleGameEnd],
  );

  const resetMapView = useCallback(() => {
    setSelectedCountry(null);
    mapResetHandlerRef.current?.();
  }, []);

  const registerMapResetHandler = useCallback((handler: () => void) => {
    mapResetHandlerRef.current = handler;
  }, []);

  const resetGame = useCallback(() => {
    setGuessedCountries(new Set());
    setSelectedCountry(null);
    setLivesRemaining(GAME_CONFIG.INITIAL_LIVES);
    setTimeRemaining(GAME_CONFIG.INITIAL_TIME_SECONDS);
    setGameStartedAt(null);
    setWrongGuesses([]);
    setGameStatus("idle");
    clearCurrentGame();
  }, []);

  // Computed values
  const correctGuesses = guessedCountries.size;
  const remainingCountries = countries.length - guessedCountries.size;

  const regionProgress = useMemo(
    () => calculateRegionProgress(countries, guessedCountries),
    [countries, guessedCountries],
  );

  const countryCentroids = useMemo(
    () => computeAllCentroids(countries),
    [countries],
  );

  const value: GameContextValue = {
    countries,
    countryCentroids,
    loading,
    error,
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
    selectRandomCountry,
    submitGuess,
    resetMapView,
    registerMapResetHandler,
    resetGame,
    setTimeRemaining,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

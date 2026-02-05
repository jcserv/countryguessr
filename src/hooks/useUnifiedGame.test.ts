import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies
vi.mock("@/contexts/GameContext", () => ({
  useGameContext: vi.fn(),
}));

vi.mock("@/contexts/CompetitiveContext", () => ({
  useCompetitive: vi.fn(),
}));

vi.mock("@/hooks/useSocket", () => ({
  useSocket: vi.fn(() => ({ playerId: "test-player-id" })),
}));

vi.mock("@/hooks/useCountries", () => ({
  useCountries: vi.fn(() => ({
    countries: [
      {
        type: "Feature",
        properties: {
          NAME: "United States",
          NAME_LONG: "United States of America",
          ISO_A2: "US",
          REGION_UN: "Americas",
          SUBREGION: "Northern America",
        },
        geometry: { type: "Polygon", coordinates: [] },
      },
    ],
    loading: false,
    error: null,
  })),
}));

import { useCompetitive } from "@/contexts/CompetitiveContext";
import { useGameContext } from "@/contexts/GameContext";

import { useCompetitiveGame, useSoloGame } from "./useUnifiedGame";

describe("useSoloGame", () => {
  const mockGameContext = {
    countries: [
      {
        type: "Feature",
        properties: {
          NAME: "United States",
          NAME_LONG: "United States of America",
          ISO_A2: "US",
          REGION_UN: "Americas",
          SUBREGION: "Northern America",
        },
        geometry: { type: "Polygon", coordinates: [] },
      },
    ],
    countryCentroids: new Map(),
    loading: false,
    error: null,
    gameStatus: "idle" as const,
    guessedCountries: new Set<string>(),
    selectedCountry: null,
    livesRemaining: 3,
    timeRemaining: 1800,
    correctGuesses: 0,
    remainingCountries: 1,
    regionProgress: [],
    startGame: vi.fn(),
    endGame: vi.fn(),
    pauseGame: vi.fn(),
    resumeGame: vi.fn(),
    selectCountry: vi.fn(),
    selectRandomCountry: vi.fn(),
    submitGuess: vi.fn(() => true),
    resetMapView: vi.fn(),
    registerMapResetHandler: vi.fn(),
    resetGame: vi.fn(),
    setTimeRemaining: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useGameContext).mockReturnValue(
      mockGameContext as ReturnType<typeof useGameContext>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns mode as solo", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.mode).toBe("solo");
  });

  it("maps game status correctly", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.status).toBe("idle");
  });

  it("exposes time and lives remaining", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.timeRemaining).toBe(1800);
    expect(result.current.livesRemaining).toBe(3);
  });

  it("exposes country data", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.countries).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });

  it("exposes my progress", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.myProgress.claimedCount).toBe(0);
    expect(result.current.myProgress.remainingCount).toBe(1);
    expect(result.current.myProgress.totalCount).toBe(1);
  });

  it("wraps submitGuess in Promise", async () => {
    const { result } = renderHook(() => useSoloGame());

    const guessResult = await result.current.submitGuess("US");

    expect(guessResult.success).toBe(true);
    expect(mockGameContext.submitGuess).toHaveBeenCalledWith("US");
  });

  it("returns failed guess result when incorrect", async () => {
    vi.mocked(useGameContext).mockReturnValue({
      ...mockGameContext,
      submitGuess: vi.fn(() => false),
    } as unknown as ReturnType<typeof useGameContext>);

    const { result } = renderHook(() => useSoloGame());

    const guessResult = await result.current.submitGuess("FR");

    expect(guessResult.success).toBe(false);
  });

  it("isCountryAvailable returns true for unguessed countries", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.isCountryAvailable("US")).toBe(true);
  });

  it("isCountryAvailable returns false for guessed countries", () => {
    vi.mocked(useGameContext).mockReturnValue({
      ...mockGameContext,
      guessedCountries: new Set(["US"]),
    } as unknown as ReturnType<typeof useGameContext>);

    const { result } = renderHook(() => useSoloGame());
    expect(result.current.isCountryAvailable("US")).toBe(false);
  });

  it("getCountryOwner returns null in solo mode", () => {
    const { result } = renderHook(() => useSoloGame());
    expect(result.current.getCountryOwner("US")).toBeNull();
  });

  it("delegates game actions correctly", () => {
    const { result } = renderHook(() => useSoloGame());

    result.current.startGame();
    expect(mockGameContext.startGame).toHaveBeenCalled();

    result.current.pauseGame?.();
    expect(mockGameContext.pauseGame).toHaveBeenCalled();

    result.current.resumeGame?.();
    expect(mockGameContext.resumeGame).toHaveBeenCalled();

    result.current.endGame?.();
    expect(mockGameContext.endGame).toHaveBeenCalled();
  });
});

describe("useCompetitiveGame", () => {
  const mockCompetitiveContext = {
    gameId: "test-game-123",
    gameState: {
      gameId: "test-game-123",
      status: "lobby" as const,
      hostId: "test-player-id",
      players: new Map([
        [
          "test-player-id",
          {
            id: "test-player-id",
            nickname: "TestPlayer",
            claimedCountries: [],
            isHost: true,
            isConnected: true,
          },
        ],
      ]),
      claimedCountries: new Map<string, string>(),
      startedAt: null,
      endedAt: null,
      timeRemaining: 1800,
    },
    players: [
      {
        id: "test-player-id",
        nickname: "TestPlayer",
        claimedCountries: [],
        isHost: true,
        isConnected: true,
      },
    ],
    playerColors: new Map([["test-player-id", "#ff0000"]]),
    isHost: true,
    myClaimedCountries: [],
    startGame: vi.fn(),
    leaveGame: vi.fn(),
    claimCountry: vi.fn(() => Promise.resolve({ success: true })),
  };

  beforeEach(() => {
    vi.mocked(useCompetitive).mockReturnValue(
      mockCompetitiveContext as unknown as ReturnType<typeof useCompetitive>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns mode as competitive", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.mode).toBe("competitive");
  });

  it("maps game status from gameState", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.status).toBe("lobby");
  });

  it("exposes time remaining from gameState", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.timeRemaining).toBe(1800);
  });

  it("exposes isHost correctly", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.isHost).toBe(true);
  });

  it("exposes gameId", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.gameId).toBe("test-game-123");
  });

  it("builds player rankings", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.playerRankings).toHaveLength(1);
    expect(result.current.playerRankings?.[0].nickname).toBe("TestPlayer");
    expect(result.current.playerRankings?.[0].isMe).toBe(true);
  });

  it("submitGuess requires matching selected country", async () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: "US", onSelectCountry: vi.fn() }),
    );

    // Guessing a different country should fail
    const failResult = await result.current.submitGuess("FR");
    expect(failResult.success).toBe(false);
    expect(failResult.error).toContain("not the country you selected");

    // Guessing the selected country should succeed
    const successResult = await result.current.submitGuess("US");
    expect(successResult.success).toBe(true);
    expect(mockCompetitiveContext.claimCountry).toHaveBeenCalledWith("US");
  });

  it("isCountryAvailable returns true for unclaimed countries", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.isCountryAvailable("US")).toBe(true);
  });

  it("isCountryAvailable returns false for claimed countries", () => {
    vi.mocked(useCompetitive).mockReturnValue({
      ...mockCompetitiveContext,
      gameState: {
        ...mockCompetitiveContext.gameState,
        claimedCountries: new Map([["US", "test-player-id"]]),
      },
    } as unknown as ReturnType<typeof useCompetitive>);

    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.isCountryAvailable("US")).toBe(false);
  });

  it("getCountryOwner returns owner info for claimed countries", () => {
    vi.mocked(useCompetitive).mockReturnValue({
      ...mockCompetitiveContext,
      gameState: {
        ...mockCompetitiveContext.gameState,
        claimedCountries: new Map([["US", "test-player-id"]]),
      },
    } as unknown as ReturnType<typeof useCompetitive>);

    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    const owner = result.current.getCountryOwner("US");

    expect(owner).not.toBeNull();
    expect(owner?.id).toBe("test-player-id");
    expect(owner?.name).toBe("TestPlayer");
    expect(owner?.color).toBe("#ff0000");
  });

  it("getCountryOwner returns null for unclaimed countries", () => {
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );
    expect(result.current.getCountryOwner("US")).toBeNull();
  });

  it("delegates selectCountry to onSelectCountry callback", () => {
    const onSelectCountry = vi.fn();
    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry }),
    );

    result.current.selectCountry("US");
    expect(onSelectCountry).toHaveBeenCalledWith("US");
  });

  it("handles null gameState gracefully", () => {
    vi.mocked(useCompetitive).mockReturnValue({
      ...mockCompetitiveContext,
      gameState: null,
    } as unknown as ReturnType<typeof useCompetitive>);

    const { result } = renderHook(() =>
      useCompetitiveGame({ selectedCountry: null, onSelectCountry: vi.fn() }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.timeRemaining).toBeNull();
    expect(result.current.isCountryAvailable("US")).toBe(true);
    expect(result.current.getCountryOwner("US")).toBeNull();
  });
});

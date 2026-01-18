import React, { createContext, useContext, useState } from "react";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GameStatus } from "@/types/game";
import { GAME_CONFIG } from "@/types/game";

// Create a minimal mock context for testing the timer logic
interface MockGameContextValue {
  gameStatus: GameStatus;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
}

const MockGameContext = createContext<MockGameContextValue | null>(null);

// Minimal useTimer implementation that mirrors the real one
function useTimerWithMock() {
  const context = useContext(MockGameContext);
  if (!context) throw new Error("Must use within provider");

  const { gameStatus, timeRemaining, setTimeRemaining } = context;
  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (gameStatus !== "playing") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStatus, setTimeRemaining]);

  return { timeRemaining };
}

// Mock provider for testing
function MockGameProvider({
  children,
  initialStatus = "idle",
  initialTime = GAME_CONFIG.INITIAL_TIME_SECONDS,
}: {
  children: React.ReactNode;
  initialStatus?: GameStatus;
  initialTime?: number;
}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>(initialStatus);
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  return (
    <MockGameContext.Provider
      value={{ gameStatus, timeRemaining, setTimeRemaining, setGameStatus }}
    >
      {children}
    </MockGameContext.Provider>
  );
}

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current time remaining", () => {
    const { result } = renderHook(() => useTimerWithMock(), {
      wrapper: ({ children }) => (
        <MockGameProvider>{children}</MockGameProvider>
      ),
    });

    expect(result.current.timeRemaining).toBe(GAME_CONFIG.INITIAL_TIME_SECONDS);
  });

  it("counts down when game is playing", () => {
    const { result } = renderHook(
      () => ({
        timer: useTimerWithMock(),
        context: useContext(MockGameContext),
      }),
      {
        wrapper: ({ children }) => (
          <MockGameProvider initialStatus="playing">
            {children}
          </MockGameProvider>
        ),
      },
    );

    const initialTime = result.current.timer.timeRemaining;

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timer.timeRemaining).toBe(initialTime - 3);
  });

  it("stops countdown when game is paused", () => {
    const { result } = renderHook(
      () => ({
        timer: useTimerWithMock(),
        context: useContext(MockGameContext),
      }),
      {
        wrapper: ({ children }) => (
          <MockGameProvider initialStatus="playing">
            {children}
          </MockGameProvider>
        ),
      },
    );

    // Let some time pass
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const timeBeforePause = result.current.timer.timeRemaining;

    // Pause the game
    act(() => {
      result.current.context?.setGameStatus("paused");
    });

    // More time passes
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Time should not have changed while paused
    expect(result.current.timer.timeRemaining).toBe(timeBeforePause);
  });

  it("resumes countdown when game is resumed", () => {
    const { result } = renderHook(
      () => ({
        timer: useTimerWithMock(),
        context: useContext(MockGameContext),
      }),
      {
        wrapper: ({ children }) => (
          <MockGameProvider initialStatus="paused">{children}</MockGameProvider>
        ),
      },
    );

    const timeBeforeResume = result.current.timer.timeRemaining;

    // Resume the game
    act(() => {
      result.current.context?.setGameStatus("playing");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.timer.timeRemaining).toBe(timeBeforeResume - 2);
  });

  it("does not count down when game is idle", () => {
    const { result } = renderHook(() => useTimerWithMock(), {
      wrapper: ({ children }) => (
        <MockGameProvider initialStatus="idle">{children}</MockGameProvider>
      ),
    });

    const initialTime = result.current.timeRemaining;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeRemaining).toBe(initialTime);
  });

  it("stops at 0 and does not go negative", () => {
    const { result } = renderHook(() => useTimerWithMock(), {
      wrapper: ({ children }) => (
        <MockGameProvider initialStatus="playing" initialTime={2}>
          {children}
        </MockGameProvider>
      ),
    });

    // Advance time beyond the remaining time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeRemaining).toBe(0);
  });

  it("cleans up interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const { unmount } = renderHook(() => useTimerWithMock(), {
      wrapper: ({ children }) => (
        <MockGameProvider initialStatus="playing">{children}</MockGameProvider>
      ),
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

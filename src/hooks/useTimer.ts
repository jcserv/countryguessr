import { useEffect, useRef } from "react";

import { useGameContext } from "@/contexts/GameContext";

export function useTimer() {
  const { gameStatus, timeRemaining, setTimeRemaining } = useGameContext();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run timer when game is playing
    if (gameStatus !== "playing") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start the countdown
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

    // Cleanup on unmount or status change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStatus, setTimeRemaining]);

  return { timeRemaining };
}

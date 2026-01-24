import { useLocation } from "@tanstack/react-router";
import { Pause, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGameContext } from "@/contexts/GameContext";
import { cn } from "@/lib/utils";

export function TimerDisplay() {
  const { timeRemaining, gameStatus, pauseGame } = useGameContext();
  const location = useLocation();
  const isMainRoute = location.pathname === "/";

  if (gameStatus !== "playing" && gameStatus !== "paused") return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Warning when less than 5 minutes remain
  const isWarning = timeRemaining <= 300;
  // Critical when less than 1 minute remains
  const isCritical = timeRemaining <= 60;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg",
          isCritical &&
            "animate-pulse bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
          isWarning &&
            !isCritical &&
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
          !isWarning && "bg-muted",
        )}
      >
        <Timer className="w-5 h-5" />
        <span>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      {gameStatus === "playing" && isMainRoute && (
        <Button
          variant="ghost"
          size="icon"
          onClick={pauseGame}
          className="w-10 h-10"
          title="Pause game"
        >
          <Pause className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

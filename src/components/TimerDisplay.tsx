import { useLocation } from "@tanstack/react-router";
import { Pause, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompetitiveTimer } from "@/contexts/CompetitiveTimerContext";
import { useGameContext } from "@/contexts/GameContext";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  // Optional overrides for competitive mode
  timeRemaining?: number | null;
  status?: string;
  showPause?: boolean;
  onPause?: () => void;
}

export function TimerDisplay({
  timeRemaining: propTimeRemaining,
  status: propStatus,
  showPause: propShowPause,
  onPause: propOnPause,
}: TimerDisplayProps = {}) {
  // Get solo context values as defaults
  const soloContext = useGameContext();
  const location = useLocation();
  const isMainRoute = location.pathname === "/";
  const isCompetitiveRoute = location.pathname.startsWith("/competitive/");

  // Get competitive timer from global context (works even in Header)
  const competitiveTimer = useCompetitiveTimer();
  const competitiveTimeRemaining = competitiveTimer.timeRemaining;
  const competitiveStatus = competitiveTimer.status;

  // Use props if provided, then competitive context (if on competitive route), then solo context
  const timeRemaining =
    propTimeRemaining ??
    (isCompetitiveRoute ? competitiveTimeRemaining : null) ??
    soloContext.timeRemaining;
  const gameStatus =
    propStatus ??
    (isCompetitiveRoute ? competitiveStatus : null) ??
    soloContext.gameStatus;
  const pauseGame = propOnPause ?? soloContext.pauseGame;
  // Only show pause button on main route (solo mode)
  const showPause = propShowPause ?? (isMainRoute && gameStatus === "playing");

  if (gameStatus !== "playing" && gameStatus !== "paused") return null;
  if (location.pathname === "/stats") return null;
  if (timeRemaining === null) return null;

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
      {showPause && (
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

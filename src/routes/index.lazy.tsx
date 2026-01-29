import { useState } from "react";

import { createLazyFileRoute } from "@tanstack/react-router";

import { GameMap } from "@/components/GameMap";
import { GameOverDialog } from "@/components/GameOverDialog";
import { GuessCommandDialog } from "@/components/GuessCommandDialog";
import { InstructionsCard } from "@/components/InstructionsCard";
import { PauseDialog } from "@/components/PauseDialog";
import { ProgressCard } from "@/components/ProgressCard";
import { StartScreen } from "@/components/StartScreen";
import { Button } from "@/components/ui/button";
import { useGameContext } from "@/contexts/GameContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTimer } from "@/hooks/useTimer";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { gameStatus, endGame, selectedCountry } = useGameContext();
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);

  // Initialize timer and keyboard shortcuts
  useTimer();
  useKeyboardShortcuts({
    onOpenGuessDialog: () => setGuessDialogOpen(true),
  });

  const isIdle = gameStatus === "idle";

  return (
    <div className="relative flex md:flex-row flex-col gap-4 p-4 h-[calc(100vh-64px)] overflow-auto md:overflow-hidden">
      {/* Start Screen Overlay */}
      {isIdle && <StartScreen />}

      {/* Game Over Dialog */}
      <GameOverDialog />

      {/* Pause Dialog */}
      <PauseDialog />

      {/* Map Container - order-2 on mobile, order-none on desktop */}
      <div
        className={`order-2 md:order-none shrink-0 h-[50vh] w-full overflow-hidden rounded-lg border shadow-lg md:h-full md:w-2/3 ${isIdle ? "opacity-50" : ""}`}
      >
        <GameMap
          dimmed={isIdle}
          onCountryDoubleClick={() => setGuessDialogOpen(true)}
        />
      </div>

      {/* Sidebar - contents on mobile (children participate in parent flex), normal on desktop */}
      <div className="contents md:flex md:flex-col md:gap-4 md:w-1/3">
        {/* Cards area - order-1 on mobile, fills available space on desktop */}
        <div className="order-1 md:order-none md:flex-1 md:overflow-y-auto md:space-y-4 md:min-h-0">
          <InstructionsCard />
          <div className="hidden md:block">
            <ProgressCard />
          </div>
        </div>

        {/* ProgressCard + Buttons - order-3 on mobile (appears after map) */}
        <div className="flex flex-col gap-4 order-3 md:order-none md:shrink-0">
          <div className="md:hidden">
            <ProgressCard />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              {selectedCountry && (
                <Button
                  className="flex-1"
                  onClick={() => setGuessDialogOpen(true)}
                  variant="default"
                >
                  Guess
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={endGame}
                className="flex-1"
              >
                End Quiz
              </Button>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Made by Jarrod Servilla, heavily inspired by{" "}
              <a className="underline" href="https://challenge.elsewhere.to/">
                The Elsewhere Challenge
              </a>
            </p>
          </div>
          <GuessCommandDialog
            open={guessDialogOpen}
            onOpenChange={setGuessDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}

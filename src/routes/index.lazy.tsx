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

      {/* Map Container */}
      <div
        className={`shrink-0 h-[50vh] w-full overflow-hidden rounded-lg border shadow-lg md:h-full md:w-2/3 ${isIdle ? "opacity-50" : ""}`}
      >
        <GameMap
          dimmed={isIdle}
          onCountryDoubleClick={() => setGuessDialogOpen(true)}
        />
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4 w-full md:w-1/3">
        <>
          <InstructionsCard />
          <ProgressCard />
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
            <Button variant="destructive" onClick={endGame} className="flex-1">
              End Quiz
            </Button>
          </div>
          <div className="flex justify-center">
            <p className="text-muted-foreground text-sm">
              Heavily inspired by{" "}
              <a className="underline" href="https://challenge.elsewhere.to/">
                The Elsewhere Challenge
              </a>
            </p>
          </div>
          <GuessCommandDialog
            open={guessDialogOpen}
            onOpenChange={setGuessDialogOpen}
          />
        </>
      </div>
    </div>
  );
}

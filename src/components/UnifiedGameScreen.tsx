import { useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { CompetitiveMap } from "@/components/competitive/CompetitiveMap";
import { Lobby } from "@/components/competitive/Lobby";
import { Scoreboard } from "@/components/competitive/Scoreboard";
import { GameMap } from "@/components/GameMap";
import { GameOverDialog } from "@/components/GameOverDialog";
import { InstructionsCard } from "@/components/InstructionsCard";
import { PauseDialog } from "@/components/PauseDialog";
import { StartScreen } from "@/components/StartScreen";
import { Button } from "@/components/ui/button";
import { UnifiedGuessDialog } from "@/components/UnifiedGuessDialog";
import { UnifiedProgressCard } from "@/components/UnifiedProgressCard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTimer } from "@/hooks/useTimer";
import { useCompetitiveGame, useSoloGame } from "@/hooks/useUnifiedGame";
import type { UnifiedGame, UnifiedGameMode } from "@/types/unified-game";

interface UnifiedGameScreenProps {
  mode: UnifiedGameMode;
}

export function UnifiedGameScreen({ mode }: UnifiedGameScreenProps) {
  // Render mode-specific component to avoid conditional hook calls
  if (mode === "solo") {
    return <SoloGameScreen />;
  }
  return <CompetitiveGameScreen />;
}

/**
 * Solo mode game screen - uses useSoloGame hook unconditionally
 */
function SoloGameScreen() {
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);
  const game = useSoloGame();

  // Initialize timer
  useTimer();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onOpenGuessDialog: () => setGuessDialogOpen(true),
    isDialogOpen: guessDialogOpen,
  });

  if (game.status === "idle") {
    return (
      <div className="relative flex md:flex-row flex-col gap-4 p-4 h-[calc(100vh-64px)] overflow-auto md:overflow-hidden">
        <StartScreen />
        <div className="order-2 md:order-none shrink-0 h-[50vh] w-full overflow-hidden rounded-lg border shadow-lg md:h-full md:w-2/3 opacity-50">
          <GameMap dimmed />
        </div>
        <div className="contents md:flex md:flex-col md:gap-4 md:w-1/3">
          <div className="order-1 md:order-none md:flex-1 md:overflow-y-auto md:space-y-4 md:min-h-0">
            <InstructionsCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameScreenLayout
      game={game}
      guessDialogOpen={guessDialogOpen}
      setGuessDialogOpen={setGuessDialogOpen}
    />
  );
}

/**
 * Competitive mode game screen - uses useCompetitiveGame hook unconditionally
 */
function CompetitiveGameScreen() {
  const navigate = useNavigate();
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const game = useCompetitiveGame({
    selectedCountry,
    onSelectCountry: setSelectedCountry,
  });

  // Keyboard shortcuts with competitive mode parameters
  useKeyboardShortcuts({
    onOpenGuessDialog: () => setGuessDialogOpen(true),
    isDialogOpen: guessDialogOpen,
    gameStatus: game.status,
    selectedCountry,
    selectCountry: (code) => setSelectedCountry(code),
    countryCentroids: game.countryCentroids,
    unavailableCountries: game.unavailableCountries,
  });

  const handleLeave = () => {
    game.leaveGame?.();
    navigate({ to: "/" });
  };

  if (game.status === "lobby") {
    return <Lobby onLeave={handleLeave} />;
  }

  if (game.status === "finished") {
    return <Scoreboard onLeave={handleLeave} />;
  }

  return (
    <GameScreenLayout
      game={game}
      guessDialogOpen={guessDialogOpen}
      setGuessDialogOpen={setGuessDialogOpen}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
    />
  );
}

/**
 * Shared game screen layout used by both solo and competitive modes
 */
interface GameScreenLayoutProps {
  game: UnifiedGame;
  guessDialogOpen: boolean;
  setGuessDialogOpen: (open: boolean) => void;
  // Competitive mode props
  selectedCountry?: string | null;
  setSelectedCountry?: (code: string | null) => void;
}

function GameScreenLayout({
  game,
  guessDialogOpen,
  setGuessDialogOpen,
  selectedCountry,
  setSelectedCountry,
}: GameScreenLayoutProps) {
  const navigate = useNavigate();

  const handleLeave = () => {
    game.leaveGame?.();
    navigate({ to: "/" });
  };

  // Use mode-specific selected country for solo
  const currentSelectedCountry =
    game.mode === "solo" ? game.selectedCountry : (selectedCountry ?? null);

  return (
    <div className="relative flex md:flex-row flex-col gap-4 p-4 h-[calc(100vh-64px)] overflow-auto md:overflow-hidden">
      {/* Solo mode dialogs */}
      {game.mode === "solo" && (
        <>
          <GameOverDialog />
          <PauseDialog />
        </>
      )}

      {/* Map Container */}
      <div className="order-2 md:order-none shrink-0 h-[50vh] w-full overflow-hidden rounded-lg border shadow-lg md:h-full md:w-2/3">
        {game.mode === "solo" ? (
          <GameMap onCountryDoubleClick={() => setGuessDialogOpen(true)} />
        ) : (
          <CompetitiveMap
            onCountryDoubleClick={() => setGuessDialogOpen(true)}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
          />
        )}
      </div>

      {/* Sidebar */}
      <div className="contents md:flex md:flex-col md:gap-4 md:w-1/3">
        {/* Cards area */}
        <div className="order-1 md:order-none md:flex-1 md:overflow-y-auto md:space-y-4 md:min-h-0">
          <InstructionsCard />

          <div className="hidden md:block">
            <UnifiedProgressCard
              mode={game.mode}
              myProgress={game.myProgress}
              livesRemaining={game.livesRemaining}
              regionProgress={game.regionProgress}
              playerRankings={game.playerRankings}
            />
          </div>
        </div>

        {/* ProgressCard + Buttons */}
        <div className="flex flex-col gap-4 order-3 md:order-none md:shrink-0">
          <div className="md:hidden">
            <UnifiedProgressCard
              mode={game.mode}
              myProgress={game.myProgress}
              livesRemaining={game.livesRemaining}
              regionProgress={game.regionProgress}
              playerRankings={game.playerRankings}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              {game.mode === "solo" ? (
                <Button
                  variant="destructive"
                  onClick={game.endGame}
                  className="flex-1"
                >
                  End Quiz
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleLeave}
                  className="flex-1"
                >
                  Leave
                </Button>
              )}
            </div>

            {game.mode === "solo" && (
              <p className="text-muted-foreground text-sm text-center">
                Made by{" "}
                <a className="underline" href="https://jarrodservilla.com">
                  Jarrod Servilla
                </a>
                , heavily inspired by{" "}
                <a className="underline" href="https://challenge.elsewhere.to/">
                  The Elsewhere Challenge
                </a>
              </p>
            )}
          </div>

          <UnifiedGuessDialog
            open={guessDialogOpen}
            onOpenChange={setGuessDialogOpen}
            mode={game.mode}
            status={game.status}
            selectedCountry={currentSelectedCountry}
            countries={game.countries}
            isCountryAvailable={game.isCountryAvailable}
            submitGuess={game.submitGuess}
          />
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";

import { ArrowLeft, Copy, Trophy, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameContext } from "@/contexts/GameContext";
import { GAME_CONFIG } from "@/types/game";

type GameoverMode = "base" | "share";

export function GameOverDialog() {
  const {
    gameStatus,
    correctGuesses,
    countries,
    livesRemaining,
    timeRemaining,
    resetGame,
    regionProgress,
  } = useGameContext();

  const [mode, setMode] = useState<GameoverMode>("base");
  const [copied, setCopied] = useState(false);

  const isOpen = gameStatus === "won" || gameStatus === "lost";
  const isWin = gameStatus === "won";

  const totalCountries = countries.length;
  const timeUsed = GAME_CONFIG.INITIAL_TIME_SECONDS - timeRemaining;
  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;

  const regionEmojis: Record<string, string> = {
    Europe: "🦊",
    Americas: "🦅",
    Africa: "🦁",
    "Middle East & Central Asia": "🐪",
    "Asia & Oceania": "🐼",
  };

  const shareText = useMemo(() => {
    const regionStats = regionProgress
      .map((r) => `${regionEmojis[r.region]} ${r.guessed}/${r.total}`)
      .join(" ");

    return (
      `I guessed ${correctGuesses}/${totalCountries} countries in ` +
      `${minutes}m ${seconds}s on CountryGuessr\n` +
      `${regionStats}\n` +
      `Think you can beat me?: ${window.location.origin}`
    );
  }, [correctGuesses, totalCountries, minutes, seconds, regionProgress]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center gap-2 text-2xl">
            {isWin ? (
              <>
                <Trophy className="w-6 h-6 text-yellow-500" />
                Congratulations!
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-500" />
                Game over
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "share"
              ? "Copy your results and share them with friends"
              : isWin
                ? "You identified all the countries!"
                : livesRemaining <= 0
                  ? "You ran out of lives."
                  : "Time ran out!"}
          </DialogDescription>
        </DialogHeader>

        {mode === "base" ? (
          <div className="gap-4 grid grid-cols-2 py-4">
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Correct</p>
              <p className="font-bold text-2xl">
                {correctGuesses}/{totalCountries}
              </p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Time Elapsed</p>
              <p className="font-bold text-2xl">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Lives Remaining</p>
              <p className="font-bold text-2xl">{livesRemaining}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Accuracy</p>
              <p className="font-bold text-2xl">
                {totalCountries > 0
                  ? Math.round((correctGuesses / totalCountries) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <textarea
              readOnly
              value={shareText}
              className="bg-muted p-3 border rounded-md w-full h-32 text-sm resize-none"
            />
            <Button onClick={handleCopy} className="w-full" variant="secondary">
              <Copy className="mr-2 w-4 h-4" />
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        )}

        <DialogFooter className="flex-col gap-2">
          {mode === "share" ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setMode("base")}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to results
            </Button>
          ) : (
            <>
              <Button onClick={resetGame} className="w-full" size="lg">
                🔄 Play Again
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={() => setMode("share")}
              >
                🏆 Share Results
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

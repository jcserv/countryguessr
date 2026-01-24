import { Pause } from "lucide-react";

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

export function PauseDialog() {
  const { gameStatus, resumeGame, resetGame } = useGameContext();

  const isOpen = gameStatus === "paused";

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center gap-2 text-2xl">
            <Pause className="w-6 h-6" />
            Game paused
          </DialogTitle>
          <DialogDescription className="text-center">
            The game is paused. Click resume to continue playing.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2">
          <Button onClick={resumeGame} className="w-full" size="lg">
            Resume
          </Button>
          <Button
            onClick={resetGame}
            className="w-full"
            size="lg"
            variant="destructive"
          >
            Restart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

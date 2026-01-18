import { Dices, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGameContext } from "@/contexts/GameContext";
import { isWindows } from "@/lib/utils";

interface MapControlsProps {
  onResetView: () => void;
}

export function MapControls({ onResetView }: MapControlsProps) {
  const { selectRandomCountry, gameStatus } = useGameContext();
  const isWin = isWindows();
  const shortcutKey = isWin ? "Ctrl+R" : "Cmd+R";

  if (gameStatus !== "playing") return null;

  return (
    <div className="top-2 right-2 z-[1000] absolute flex flex-col gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onResetView}
        className="shadow-md"
        title="Reset View (Esc)"
      >
        <RotateCcw className="mr-1 w-4 h-4" />
        Reset View (Esc)
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={selectRandomCountry}
        className="shadow-md"
        title={`Random Country (${shortcutKey})`}
      >
        <Dices className="mr-1 w-4 h-4" />
        Random ({shortcutKey})
      </Button>
    </div>
  );
}

import { Heart } from "lucide-react";

import { GAME_CONFIG } from "@/types/game";

interface LivesDisplayProps {
  livesRemaining: number;
}

export function LivesDisplay({ livesRemaining }: LivesDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: GAME_CONFIG.INITIAL_LIVES }).map((_, index) => (
        <Heart
          key={index}
          className={`h-5 w-5 transition-all duration-300 ${
            index < livesRemaining
              ? "fill-red-500 text-red-500"
              : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

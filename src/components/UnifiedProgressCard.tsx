import { Crown, Heart, Skull, User, UserX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RegionProgress } from "@/types/game";
import type { PlayerProgress } from "@/types/unified-game";

import { LivesDisplay } from "./LivesDisplay";
import { RegionProgressBar } from "./RegionProgressBar";

interface UnifiedProgressCardProps {
  mode: "solo" | "competitive";
  myProgress: {
    claimedCount: number;
    remainingCount: number;
    totalCount: number;
  };
  livesRemaining?: number;
  regionProgress?: RegionProgress[];
  playerRankings?: PlayerProgress[];
}

export function UnifiedProgressCard({
  mode,
  myProgress,
  livesRemaining,
  regionProgress,
  playerRankings,
}: UnifiedProgressCardProps) {
  const progressPercentage =
    myProgress.totalCount > 0
      ? (myProgress.claimedCount / myProgress.totalCount) * 100
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row - same for both modes */}
        <div className="gap-2 grid grid-cols-3 text-center">
          <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
            <p className="font-medium text-muted-foreground text-xs">
              {mode === "solo" ? "CORRECT" : "CLAIMED"}
            </p>
            <p className="font-bold text-green-600 dark:text-green-400 text-xl">
              {myProgress.claimedCount}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
            <p className="font-medium text-muted-foreground text-xs">
              REMAINING
            </p>
            <p className="font-bold text-xl">{myProgress.remainingCount}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 p-2 rounded-lg">
            <p className="font-medium text-muted-foreground text-xs">LIVES</p>
            <div className="flex justify-center pt-1">
              <LivesDisplay livesRemaining={livesRemaining ?? 0} />
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-full h-3">
            <div
              className={cn(
                "rounded-full h-full transition-all duration-300",
                mode === "solo" ? "bg-green-500" : "bg-primary",
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Regional progress - both modes */}
        {regionProgress && regionProgress.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-sm">
              {mode === "solo" ? "Regions" : "Your Regions"}
            </p>
            {regionProgress.map((progress) => (
              <RegionProgressBar key={progress.region} progress={progress} />
            ))}
          </div>
        )}

        {/* Player rankings - Competitive only */}
        {mode === "competitive" &&
          playerRankings &&
          playerRankings.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Leaderboard</p>
              {playerRankings.map((player, index) => (
                <div
                  key={player.playerId}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    player.isMe && "bg-muted",
                    player.isEliminated && "opacity-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    {player.isEliminated ? (
                      <Skull className="w-4 h-4 text-muted-foreground" />
                    ) : player.isConnected ? (
                      <User className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <UserX className="w-4 h-4 text-muted-foreground opacity-50" />
                    )}
                    <span
                      className={cn(
                        "font-medium text-sm",
                        !player.isConnected && "opacity-50",
                        player.isEliminated && "line-through",
                      )}
                    >
                      {player.nickname}
                      {player.isMe && " (You)"}
                    </span>
                    {index === 0 && player.claimedCount > 0 && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {player.lives !== undefined && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={cn(
                              "w-3 h-3",
                              i < (player.lives ?? 0)
                                ? "fill-red-500 text-red-500"
                                : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600",
                            )}
                          />
                        ))}
                      </div>
                    )}
                    <span className="text-sm font-bold">
                      {player.claimedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}

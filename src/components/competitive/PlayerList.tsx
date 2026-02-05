import { Crown, Heart, Skull, User, UserX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompetitive } from "@/contexts/CompetitiveContext";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  showScores?: boolean;
}

export function PlayerList({ showScores = true }: PlayerListProps) {
  const { playerId } = useSocket();
  const { players, playerColors, gameState } = useCompetitive();

  // Sort players: eliminated last, then host first, then by claimed countries (descending), then alphabetically
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
    if (a.isHost !== b.isHost) return a.isHost ? -1 : 1;
    if (showScores) {
      const aCount = a.claimedCountries.length;
      const bCount = b.claimedCountries.length;
      if (aCount !== bCount) return bCount - aCount;
    }
    return a.nickname.localeCompare(b.nickname);
  });

  const totalCountries = 178;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Players ({players.length})</span>
          {gameState?.timeRemaining != null && (
            <span className="text-sm font-normal text-muted-foreground">
              {formatTime(gameState.timeRemaining)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedPlayers.map((player) => {
          const color = playerColors.get(player.id);
          const isMe = player.id === playerId;
          const claimedCount = player.claimedCountries.length;

          return (
            <div
              key={player.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg",
                isMe && "bg-muted",
                player.isEliminated && "opacity-50",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
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
                    "font-medium",
                    !player.isConnected && "opacity-50",
                    player.isEliminated && "line-through",
                  )}
                >
                  {player.nickname}
                  {isMe && " (You)"}
                </span>
                {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="flex items-center gap-2">
                {showScores && gameState?.status === "playing" && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < player.lives
                            ? "fill-red-500 text-red-500"
                            : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600",
                        )}
                      />
                    ))}
                  </div>
                )}
                {showScores && (
                  <span className="text-sm text-muted-foreground">
                    {claimedCount}/{totalCountries}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

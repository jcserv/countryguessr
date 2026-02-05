import { Crown, Medal, Skull, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCompetitive } from "@/contexts/CompetitiveContext";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  onLeave: () => void;
}

export function Scoreboard({ onLeave }: ScoreboardProps) {
  const { playerId } = useSocket();
  const { rankings, playerColors, gameState } = useCompetitive();

  if (!rankings || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  const winner = rankings[0];
  const isWinner = winner?.player_id === playerId;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Game Over!</CardTitle>
          <CardDescription>
            {isWinner
              ? "Congratulations, you won!"
              : winner
                ? `${winner.nickname} wins!`
                : "Game ended"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rankings */}
          <div className="space-y-2">
            {rankings.map((rank, index) => {
              const color = playerColors.get(rank.player_id);
              const isMe = rank.player_id === playerId;

              return (
                <div
                  key={rank.player_id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    isMe && "bg-muted",
                    index === 0 && "border-2 border-yellow-500",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                      {index === 0 ? (
                        <Crown className="w-6 h-6 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="w-5 h-5 text-gray-400" />
                      ) : index === 2 ? (
                        <Medal className="w-5 h-5 text-amber-700" />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">
                      {rank.nickname}
                      {isMe && " (You)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rank.is_eliminated && (
                      <Skull className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-lg font-bold">
                      {rank.claimed_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total countries */}
          <p className="text-sm text-center text-muted-foreground">
            Total countries claimed:{" "}
            {rankings.reduce((sum, r) => sum + r.claimed_count, 0)} / 178
          </p>

          <Button className="w-full" size="lg" onClick={onLeave}>
            Back to Lobby
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

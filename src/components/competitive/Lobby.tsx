import { useState } from "react";

import { Loader2, Play, Users } from "lucide-react";

import { ConnectionStatus } from "@/components/competitive/ConnectionStatus";
import { PlayerList } from "@/components/competitive/PlayerList";
import { RoomCodeDisplay } from "@/components/competitive/RoomCodeDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCompetitive } from "@/contexts/CompetitiveContext";

interface LobbyProps {
  onLeave: () => void;
}

export function Lobby({ onLeave }: LobbyProps) {
  const { gameId, gameState, isHost, players, startGame } = useCompetitive();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = isHost && players.length >= 1;

  const handleStart = async () => {
    if (!canStart) return;

    setIsStarting(true);
    setError(null);

    try {
      await startGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
      setIsStarting(false);
    }
  };

  if (!gameState || !gameId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Game Lobby</CardTitle>
          <CardDescription>Waiting for players to join...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConnectionStatus />

          <RoomCodeDisplay code={gameId} />

          <PlayerList showScores={false} />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex gap-2">
            {isHost ? (
              <Button
                className="flex-1"
                size="lg"
                onClick={handleStart}
                disabled={!canStart || isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </>
                )}
              </Button>
            ) : (
              <div className="flex-1 text-center py-3 text-muted-foreground">
                Waiting for host to start...
              </div>
            )}
            <Button
              className="flex-1"
              variant="outline"
              size="lg"
              onClick={onLeave}
            >
              Leave
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

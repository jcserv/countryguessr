import { useEffect, useState } from "react";

import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Users } from "lucide-react";

import { ConnectionStatus } from "@/components/competitive/ConnectionStatus";
import { NicknameInput } from "@/components/competitive/NicknameInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/useSocket";
import { loadNickname, saveNickname } from "@/lib/storage";

export const Route = createLazyFileRoute("/competitive/")({
  component: CompetitiveIndex,
});

/**
 * Generate a random 6-character room code
 */
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function CompetitiveIndex() {
  const navigate = useNavigate();
  const { connected, connecting, connect } = useSocket();
  const [nickname, setNickname] = useState(() => loadNickname() || "");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNicknameValid = nickname.trim().length >= 2;

  const handleCreateRoom = () => {
    if (!isNicknameValid) return;

    setIsCreating(true);
    setError(null);
    saveNickname(nickname.trim());

    // Generate room code client-side and navigate directly
    // The game channel will be created on-demand when we join
    const newRoomCode = generateRoomCode();
    navigate({
      to: "/competitive/$gameId",
      params: { gameId: newRoomCode },
    });
  };

  const handleJoinRoom = () => {
    if (!isNicknameValid || !roomCode.trim()) return;

    setIsJoining(true);
    setError(null);
    saveNickname(nickname.trim());

    // Navigate directly to the room - game channels are created on-demand
    navigate({
      to: "/competitive/$gameId",
      params: { gameId: roomCode.trim().toUpperCase() },
    });
  };

  // Auto-connect when component mounts
  useEffect(() => {
    if (!connected && !connecting) {
      connect();
    }
  }, [connected, connecting, connect]);

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Competitive Mode</CardTitle>
          <CardDescription>
            Race against other players to claim the most countries!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConnectionStatus />

          <NicknameInput
            value={nickname}
            onChange={setNickname}
            disabled={!connected || isCreating || isJoining}
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateRoom}
              disabled={
                !connected || !isNicknameValid || isCreating || isJoining
              }
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Room"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">
                  Or join existing
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                disabled={!connected || isCreating || isJoining}
                className="uppercase"
                maxLength={8}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={
                  !connected ||
                  !isNicknameValid ||
                  !roomCode.trim() ||
                  isCreating ||
                  isJoining
                }
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Join"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

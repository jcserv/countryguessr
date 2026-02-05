import { useEffect, useState } from "react";

import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Globe, Heart, Loader2, Timer, Users } from "lucide-react";

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
import { useGameContext } from "@/contexts/GameContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { useSocket } from "@/hooks/useSocket";
import { loadNickname, saveNickname } from "@/lib/storage";

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

export function StartScreen() {
  const { startGame, countries } = useGameContext();
  const [view, setView] = useState<"main" | "multiplayer">("main");

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {view === "multiplayer" && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            onClick={() => setView("main")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Globe className="h-6 w-6" />
            CountryGuessr
          </CardTitle>
          <CardDescription>Test your world geography knowledge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {view === "main" ? (
            <>
              <p className="text-center text-sm text-muted-foreground">
                Click on countries on the map and type their names to identify
                them. Can you name all {countries.length} countries before time
                runs out?
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <span>30 minute timer</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>3 lives</span>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">How to play:</p>
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                  <li>Click any country on the map to select it</li>
                  <li>Type the country&apos;s name in the search box</li>
                  <li>Select the correct answer from the suggestions</li>
                  <li>Wrong answers cost you a life!</li>
                </ol>
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                <Globe className="h-4 w-4 mr-2" />
                Play solo
              </Button>

              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setView("multiplayer")}
              >
                <Users className="h-4 w-4 mr-2" />
                Play with friends
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-center">
                Play with friends
              </h3>

              <SocketProvider>
                <CompetitiveSection />
              </SocketProvider>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitiveSection() {
  const navigate = useNavigate();
  const { connected, connecting, connect } = useSocket();
  const [nickname, setNickname] = useState(() => loadNickname() || "");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const isNicknameValid = nickname.trim().length >= 2;

  // Auto-connect when section is shown
  useEffect(() => {
    if (!connected && !connecting) {
      connect();
    }
  }, [connected, connecting, connect]);

  const handleCreateRoom = () => {
    if (!isNicknameValid) return;

    setIsCreating(true);
    saveNickname(nickname.trim());

    const newRoomCode = generateRoomCode();
    navigate({
      to: "/competitive/$gameId",
      params: { gameId: newRoomCode },
    });
  };

  const handleJoinRoom = () => {
    if (!isNicknameValid || !roomCode.trim()) return;

    setIsJoining(true);
    saveNickname(nickname.trim());

    navigate({
      to: "/competitive/$gameId",
      params: { gameId: roomCode.trim().toUpperCase() },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <ConnectionStatus />

      <NicknameInput
        value={nickname}
        onChange={setNickname}
        disabled={!connected || isCreating || isJoining}
      />

      <Button
        className="w-full"
        onClick={handleCreateRoom}
        disabled={!connected || !isNicknameValid || isCreating || isJoining}
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
          {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
        </Button>
      </div>
    </div>
  );
}

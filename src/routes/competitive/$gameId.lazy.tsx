import { useEffect, useState } from "react";

import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { UnifiedGameScreen } from "@/components/UnifiedGameScreen";
import {
  CompetitiveProvider,
  useCompetitive,
} from "@/contexts/CompetitiveContext";
import { useSocket } from "@/hooks/useSocket";
import { loadNickname } from "@/lib/storage";

export const Route = createLazyFileRoute("/competitive/$gameId")({
  component: CompetitiveGameWrapper,
});

function CompetitiveGameWrapper() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const { connected, connecting, connect } = useSocket();
  const [nickname] = useState(() => loadNickname());

  // Redirect if no nickname
  useEffect(() => {
    if (!nickname) {
      navigate({ to: "/" });
    }
  }, [nickname, navigate]);

  // Auto-connect if not connected
  useEffect(() => {
    if (!connected && !connecting) {
      connect();
    }
  }, [connected, connecting, connect]);

  // Show loading while redirecting or connecting
  if (!nickname || !connected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <p className="text-muted-foreground">
          {!nickname ? "Redirecting..." : "Connecting..."}
        </p>
      </div>
    );
  }

  return (
    <CompetitiveProvider gameId={gameId} nickname={nickname}>
      <CompetitiveGame />
    </CompetitiveProvider>
  );
}

function CompetitiveGame() {
  const navigate = useNavigate();
  const { joined, error, leaveGame } = useCompetitive();

  const handleLeave = () => {
    leaveGame();
    navigate({ to: "/" });
  };

  // Loading state
  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-4">
        {error ? (
          <>
            <p className="text-red-500">
              {error instanceof Error ? error.message : "Failed to join game"}
            </p>
            <Button onClick={handleLeave}>Back to Lobby</Button>
          </>
        ) : (
          <p className="text-muted-foreground">Joining game...</p>
        )}
      </div>
    );
  }

  return <UnifiedGameScreen mode="competitive" />;
}

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Socket } from "phoenix";

import { disconnectSocket, getSocket } from "@/lib/socket";
import { getPlayerId } from "@/lib/storage";

export interface SocketContextValue {
  socket: Socket | null;
  playerId: string;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get or create a persistent player ID
  const playerId = useMemo(() => getPlayerId(), []);

  const connect = useCallback(() => {
    if (socket?.isConnected()) return;

    setConnecting(true);
    setError(null);

    const newSocket = getSocket(playerId);

    newSocket.onOpen(() => {
      setConnected(true);
      setConnecting(false);
      setError(null);
    });

    newSocket.onClose(() => {
      setConnected(false);
    });

    newSocket.onError((err) => {
      setError(
        err instanceof Error ? err.message : "Failed to connect to server",
      );
      setConnecting(false);
    });

    newSocket.connect();
    setSocket(newSocket);
  }, [playerId, socket]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setConnected(false);
    setConnecting(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const value: SocketContextValue = useMemo(
    () => ({
      socket,
      playerId,
      connected,
      connecting,
      error,
      connect,
      disconnect,
    }),
    [socket, playerId, connected, connecting, error, connect, disconnect],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

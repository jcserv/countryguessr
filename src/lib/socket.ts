import { Socket } from "phoenix";

// Note: Phoenix socket client automatically appends /websocket to the endpoint
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000/socket";

let socketInstance: Socket | null = null;

/**
 * Get or create a Phoenix socket instance
 * The socket is lazily initialized and reused across the application
 */
export function getSocket(playerId: string): Socket {
  if (socketInstance) {
    // Update params if needed and reconnect
    const currentParams = socketInstance.params();
    if (currentParams.player_id !== playerId) {
      socketInstance.disconnect();
      socketInstance = null;
    } else {
      return socketInstance;
    }
  }

  socketInstance = new Socket(WS_URL, {
    params: { player_id: playerId },
  });

  return socketInstance;
}

/**
 * Disconnect and cleanup the socket instance
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * Check if the socket is currently connected
 */
export function isSocketConnected(): boolean {
  return socketInstance?.isConnected() ?? false;
}

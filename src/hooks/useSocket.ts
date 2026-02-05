import { useContext } from "react";

import { SocketContext } from "@/contexts/SocketContext";

/**
 * Hook to access the socket context
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

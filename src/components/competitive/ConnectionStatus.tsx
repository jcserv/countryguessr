import { Loader2, Wifi, WifiOff } from "lucide-react";

import { useSocket } from "@/hooks/useSocket";

export function ConnectionStatus() {
  const { connected, connecting, error } = useSocket();

  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Connecting to server...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <WifiOff className="w-4 h-4" />
        <span>Connection failed: {error}</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <WifiOff className="w-4 h-4" />
        <span>Disconnected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
      <Wifi className="w-4 h-4" />
      <span>Connected</span>
    </div>
  );
}

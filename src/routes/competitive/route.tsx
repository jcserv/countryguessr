import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SocketProvider } from "@/contexts/SocketContext";

export const Route = createFileRoute("/competitive")({
  component: CompetitiveLayout,
});

function CompetitiveLayout() {
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}

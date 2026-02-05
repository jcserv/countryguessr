import { createLazyFileRoute } from "@tanstack/react-router";

import { UnifiedGameScreen } from "@/components/UnifiedGameScreen";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return <UnifiedGameScreen mode="solo" />;
}

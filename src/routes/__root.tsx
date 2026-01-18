import { createRootRoute, Outlet } from "@tanstack/react-router";

import { Header } from "@/components";

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <hr />
      <Outlet />
    </>
  ),
});

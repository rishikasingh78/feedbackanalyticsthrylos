import { createFileRoute, redirect } from "@tanstack/react-router";

// Old access page: the dashboard no longer needs a password, so send visitors straight there.
export const Route = createFileRoute("/dashboard-access")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});

import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ columns: "" }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (handler: unknown) => handler }),
}));
vi.mock("@tanstack/react-start/server", () => ({ setResponseHeader: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => ({
      select: (cols: string) => {
        state.columns = cols;
        return { order: () => ({ limit: async () => ({ data: [], error: null }) }) };
      },
    }),
  },
}));

import { getDashboardFeedback } from "./dashboard.functions";

describe("Open dashboard data", () => {
  it("loads without a password and never returns names or emails", async () => {
    await expect(getDashboardFeedback()).resolves.toEqual([]);
    expect(state.columns).not.toMatch(/email|customer_name/);
  });
});

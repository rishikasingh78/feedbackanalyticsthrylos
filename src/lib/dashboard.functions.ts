import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

// The dashboard is open (no password). Only non-personal columns are returned:
// customer names and emails never leave the server.
export const getDashboardFeedback = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("feedback")
    .select("id, rating, category, review_text, sentiment, is_demo, created_at")
    .order("created_at", { ascending: false }).limit(1000);
  if (error) throw new Error("Couldn't load feedback.");
  return data ?? [];
});

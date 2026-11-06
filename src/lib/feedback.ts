import { queryOptions } from "@tanstack/react-query";
import { getDashboardFeedback } from "./dashboard.functions";
import type { Sentiment } from "./sentiment";

export const CATEGORIES = ["Product", "Service", "Support", "Website", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export type FeedbackRow = {
  id: string;
  rating: number;
  category: Category;
  review_text: string;
  sentiment: Sentiment;
  is_demo: boolean;
  created_at: string;
};

export const feedbackQuery = queryOptions({
  queryKey: ["feedback"],
  queryFn: async (): Promise<{ rows: FeedbackRow[]; demo: boolean }> => {
    const data = await getDashboardFeedback();
    const all = (data ?? []) as FeedbackRow[];
    const real = all.filter((r) => !r.is_demo);
    // Demo rows are shown only while no real feedback has been collected.
    return real.length > 0 ? { rows: real, demo: false } : { rows: all, demo: true };
  },
});

export function computeStats(rows: FeedbackRow[]) {
  const total = rows.length;
  const avg = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
  const count = (s: Sentiment) => rows.filter((r) => r.sentiment === s).length;
  const pos = count("Positive"), neu = count("Neutral"), neg = count("Negative");
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  return {
    total,
    avg,
    positivePct: pct(pos),
    negativePct: pct(neg),
    sentiment: [
      { name: "Positive", value: pos },
      { name: "Neutral", value: neu },
      { name: "Negative", value: neg },
    ],
    ratings: [1, 2, 3, 4, 5].map((n) => ({ rating: `${n}★`, count: rows.filter((r) => r.rating === n).length })),
  };
}

export function trendByDay(rows: FeedbackRow[]) {
  const map = new Map<string, { date: string; reviews: number; sum: number }>();
  rows.forEach((r) => {
    const d = r.created_at.slice(0, 10);
    const e = map.get(d) ?? { date: d, reviews: 0, sum: 0 };
    e.reviews++; e.sum += r.rating;
    map.set(d, e);
  });
  return [...map.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date.slice(5), reviews: e.reviews, avg: +(e.sum / e.reviews).toFixed(2) }));
}

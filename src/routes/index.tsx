import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { MessageSquare, Star, ThumbsDown, ThumbsUp, Info } from "lucide-react";
import { CATEGORIES, computeStats, feedbackQuery, trendByDay } from "@/lib/feedback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Thrylos Customer Feedback & Review Analytics" },
      { name: "description", content: "Customer satisfaction, sentiment and review trends for the Thrylos team." },
      { property: "og:title", content: "Thrylos Customer Feedback & Review Analytics" },
      { property: "og:description", content: "Customer satisfaction, sentiment and review trends for the Thrylos team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const SENT_COLORS: Record<string, string> = {
  Positive: "var(--positive)",
  Neutral: "var(--neutral)",
  Negative: "var(--negative)",
};
const RANGES = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days", all: "All time" } as const;

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][] }) {
  return (
    <div className="min-w-0 flex-1 sm:flex-none">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-card sm:w-40" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>
      {title && <h2 className="mb-4 font-display text-sm font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

function Dashboard() {
  const { data, isLoading, error } = useQuery(feedbackQuery);
  const [range, setRange] = useState("all");
  const [category, setCategory] = useState("all");
  const [rating, setRating] = useState("all");
  const [sentiment, setSentiment] = useState("all");

  const rows = useMemo(() => {
    const cutoff = range === "all" ? 0 : Date.now() - Number(range) * 86400000;
    return (data?.rows ?? []).filter(
      (r) =>
        new Date(r.created_at).getTime() >= cutoff &&
        (category === "all" || r.category === category) &&
        (rating === "all" || r.rating === Number(rating)) &&
        (sentiment === "all" || r.sentiment === sentiment),
    );
  }, [data, range, category, rating, sentiment]);

  const stats = computeStats(rows);
  const trend = trendByDay(rows);
  const filtered = range !== "all" || category !== "all" || rating !== "all" || sentiment !== "all";

  const kpis = [
    { label: "Total Reviews", value: stats.total.toLocaleString(), icon: MessageSquare, tone: "text-primary" },
    { label: "Average Rating", value: stats.total ? `${stats.avg.toFixed(2)} / 5` : "—", icon: Star, tone: "text-star" },
    { label: "Positive Feedback", value: `${stats.positivePct}%`, icon: ThumbsUp, tone: "text-positive" },
    { label: "Negative Feedback", value: `${stats.negativePct}%`, icon: ThumbsDown, tone: "text-negative" },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Feedback Analytics</h1>
          <p className="mt-1 text-muted-foreground">Customer satisfaction and sentiment across all Thrylos touchpoints.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect label="Date range" value={range} onChange={setRange} options={Object.entries(RANGES)} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={[["all", "All categories"], ...CATEGORIES.map((c) => [c, c] as [string, string])]} />
          <FilterSelect label="Rating" value={rating} onChange={setRating} options={[["all", "All ratings"], ...[5, 4, 3, 2, 1].map((n) => [String(n), `${n} star${n > 1 ? "s" : ""}`] as [string, string])]} />
          <FilterSelect label="Sentiment" value={sentiment} onChange={setSentiment} options={[["all", "All sentiment"], ["Positive", "Positive"], ["Neutral", "Neutral"], ["Negative", "Negative"]]} />
          {filtered && (
            <Button variant="ghost" size="sm" onClick={() => { setRange("all"); setCategory("all"); setRating("all"); setSentiment("all"); }}>Reset</Button>
          )}
        </div>
      </div>

      {data?.demo && (
        <div className="flex items-start gap-3 rounded-lg border border-star/40 bg-star/10 px-4 py-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p><strong>Demo data:</strong> no real feedback has been collected yet, so sample reviews are shown. They disappear automatically after the first real submission.</p>
        </div>
      )}
      {error && <p className="text-destructive">Couldn't load feedback. Please refresh.</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
              <k.icon className={cn("h-5 w-5", k.tone)} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{isLoading ? "…" : k.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Sentiment Distribution">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.sentiment} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {stats.sentiment.map((s) => <Cell key={s.name} fill={SENT_COLORS[s.name]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Rating Distribution">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats.ratings}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="rating" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="count" name="Reviews" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Feedback Trend">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="l" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <YAxis yAxisId="r" orientation="right" domain={[1, 5]} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line yAxisId="l" type="monotone" dataKey="reviews" name="Reviews" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="avg" name="Avg rating" stroke="var(--star)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title={`Recent Feedback (${rows.length})`}>
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Date</TableHead>
                <TableHead className="w-28">Rating</TableHead>
                <TableHead className="w-24">Category</TableHead>
                <TableHead className="w-24">Sentiment</TableHead>
                <TableHead>Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 100).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{format(new Date(r.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-star">{"★".repeat(r.rating)}</span>
                    <span className="text-border">{"★".repeat(5 - r.rating)}</span>
                  </TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      r.sentiment === "Positive" && "bg-positive/15 text-positive",
                      r.sentiment === "Neutral" && "bg-neutral/20 text-foreground",
                      r.sentiment === "Negative" && "bg-negative/15 text-negative")}>{r.sentiment}</span>
                  </TableCell>
                  <TableCell className="min-w-64 max-w-xl">{r.review_text}</TableCell>
                </TableRow>
              ))}
              {!isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No feedback matches these filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}

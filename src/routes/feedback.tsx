import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeSentiment } from "@/lib/sentiment";
import { CATEGORIES } from "@/lib/feedback";
import { feedbackSchema } from "@/lib/feedback-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Share Your Feedback — Thrylos" },
      { name: "description", content: "Tell Thrylos about your experience with our products, service, support and website." },
      { property: "og:title", content: "Share Your Feedback — Thrylos" },
      { property: "og:description", content: "Rate your experience with Thrylos and leave a review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"customer_name" | "email" | "rating" | "category" | "review_text" | "form", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    const parsed = feedbackSchema.safeParse({ customer_name: name, email, rating, category, review_text: text });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs as typeof errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const d = parsed.data;
    try {
    const { error } = await supabase.from("feedback").insert({
      customer_name: d.customer_name || null,
      email: d.email || null,
      rating: d.rating,
      category: d.category,
      review_text: d.review_text,
      sentiment: analyzeSentiment(d.review_text, d.rating),
    });
    if (error) {
      setErrors({ form: "We couldn't submit your feedback. Please try again." });
      return;
    }
    qc.invalidateQueries({ queryKey: ["feedback"] });
    setName(""); setEmail(""); setRating(0); setHover(0); setCategory(""); setText("");
    setDone(true);
    } catch {
      setErrors({ form: "We couldn't submit your feedback. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="text-sm font-semibold text-accent-foreground">Share Your Feedback</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">We’d Love to Hear From You</h1>
        <p className="mt-3 text-muted-foreground">Your feedback helps Thrylos improve our products and services.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card sm:p-8">
        {done && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-md border border-positive/30 bg-positive/10 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-positive" />
            <p>Thank you! Your feedback has been submitted successfully.</p>
          </div>
        )}
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                {errors.customer_name && <p className="text-sm text-destructive">{errors.customer_name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="email" type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                   <Button
                     variant="ghost"
                     size="icon"
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                     className="h-11 w-11 rounded p-1 focus-visible:ring-2 [&_svg]:size-8"
                  >
                    <Star className={cn("h-8 w-8", (hover || rating) >= n ? "fill-star text-star" : "text-border")} />
                   </Button>
                ))}
              </div>
              {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label>Feedback Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Review / Feedback</Label>
              <Textarea id="review" rows={5} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell us what went well and what we could improve…" />
              <div className="flex justify-between text-sm">
                <span className="text-destructive">{errors.review_text}</span>
                <span className="text-muted-foreground">{text.length}/2000</span>
              </div>
            </div>

            {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Feedback"}
            </Button>
          </form>
      </div>
    </main>
  );
}

/**
 * Local, dependency-free sentiment analysis.
 * Lexicon scoring with simple negation handling. The rating acts as a
 * tie-breaker when the text is ambiguous. Replace `analyzeSentiment` with an
 * AI/NLP call later — callers only depend on the returned label.
 */
export type Sentiment = "Positive" | "Neutral" | "Negative";

const POSITIVE = [
  "good", "great", "excellent", "amazing", "awesome", "love", "loved", "fantastic",
  "perfect", "happy", "helpful", "friendly", "fast", "quick", "easy", "reliable",
  "recommend", "satisfied", "wonderful", "best", "smooth", "professional", "nice",
  "clean", "impressed", "thank", "thanks", "efficient", "value", "pleased", "superb",
];
const NEGATIVE = [
  "bad", "poor", "terrible", "awful", "hate", "slow", "broken", "broke", "worst",
  "disappointed", "disappointing", "late", "damaged", "rude", "useless", "difficult",
  "confusing", "expensive", "bug", "bugs", "error", "fail", "failed", "problem",
  "issue", "unresolved", "waste", "horrible", "annoying", "frustrating", "never",
];
const NEGATORS = ["not", "no", "never", "dont", "don't", "isn't", "isnt", "wasn't", "wasnt", "didn't", "didnt"];

export function scoreText(text: string): number {
  const words = text.toLowerCase().replace(/[^a-z'\s]/g, " ").split(/\s+/).filter(Boolean);
  let score = 0;
  words.forEach((w, i) => {
    const negated = NEGATORS.includes(words[i - 1] ?? "") || NEGATORS.includes(words[i - 2] ?? "");
    let v = 0;
    if (POSITIVE.includes(w)) v = 1;
    else if (NEGATIVE.includes(w) && !NEGATORS.includes(w)) v = -1;
    score += negated ? -v : v;
  });
  return score;
}

export function analyzeSentiment(text: string, rating?: number): Sentiment {
  const score = scoreText(text);
  if (score >= 2) return "Positive";
  if (score <= -2) return "Negative";
  const r = rating ?? 3;
  if (score === 1) return r <= 2 ? "Neutral" : "Positive";
  if (score === -1) return r >= 4 ? "Neutral" : "Negative";
  if (r >= 4) return "Positive";
  if (r <= 2) return "Negative";
  return "Neutral";
}

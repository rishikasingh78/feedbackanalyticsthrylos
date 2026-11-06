import { describe, expect, it } from "vitest";
import { analyzeSentiment } from "./sentiment";

describe("analyzeSentiment", () => {
  it("classifies clearly positive text as Positive", () => {
    expect(analyzeSentiment("Excellent product, great support, love it", 3)).toBe("Positive");
  });
  it("classifies clearly negative text as Negative", () => {
    expect(analyzeSentiment("Terrible quality, broken and slow", 3)).toBe("Negative");
  });
  it("handles negation", () => {
    expect(analyzeSentiment("not good, not helpful at all", 3)).toBe("Negative");
  });
  it("falls back to rating for neutral text", () => {
    expect(analyzeSentiment("It arrived on Tuesday", 3)).toBe("Neutral");
    expect(analyzeSentiment("It arrived on Tuesday", 5)).toBe("Positive");
  });
});

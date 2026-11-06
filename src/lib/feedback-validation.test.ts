import { describe, expect, it } from "vitest";
import { feedbackSchema } from "./feedback-validation";

const valid = { rating: 5, category: "Product", review_text: "Great service" };

describe("Feedback requirements", () => {
  it("accepts feedback without name or email", () => {
    expect(feedbackSchema.safeParse(valid).success).toBe(true);
    expect(feedbackSchema.safeParse({ ...valid, customer_name: "", email: "" }).success).toBe(true);
  });
  it("requires a whole-number rating from 1 to 5", () => {
    for (const rating of [1, 2, 3, 4, 5]) expect(feedbackSchema.safeParse({ ...valid, rating }).success).toBe(true);
    for (const rating of [undefined, 0, 6, 2.5]) expect(feedbackSchema.safeParse({ ...valid, rating }).success).toBe(false);
  });
  it("requires one of the five feedback categories", () => {
    for (const category of ["Product", "Service", "Support", "Website", "Other"]) expect(feedbackSchema.safeParse({ ...valid, category }).success).toBe(true);
    for (const category of [undefined, "", "Unknown"]) expect(feedbackSchema.safeParse({ ...valid, category }).success).toBe(false);
  });
  it("requires nonblank review text", () => {
    for (const review_text of [undefined, "", "   "]) expect(feedbackSchema.safeParse({ ...valid, review_text }).success).toBe(false);
  });
});
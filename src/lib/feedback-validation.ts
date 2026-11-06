import { z } from "zod";
import { CATEGORIES } from "./feedback";

export const feedbackSchema = z.object({
  customer_name: z.string().trim().max(100, "Name must be under 100 characters").optional(),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]).optional(),
  rating: z.number().int().min(1, "Please select a rating").max(5),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Please choose a category" }) }),
  review_text: z.string().trim().min(3, "Please write a short review").max(2000, "Review must be under 2000 characters"),
});
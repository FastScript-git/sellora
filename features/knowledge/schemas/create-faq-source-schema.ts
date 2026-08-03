import { z } from "zod";

export const faqItemSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "Question must contain at least 2 characters.")
    .max(500, "Question must not exceed 500 characters."),

  answer: z
    .string()
    .trim()
    .min(2, "Answer must contain at least 2 characters.")
    .max(5_000, "Answer must not exceed 5,000 characters."),
});

export const createFaqSourceSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required."),

  locale: z.enum(["en", "uk"]),

  title: z
    .string()
    .trim()
    .min(1, "FAQ title is required.")
    .max(
      120,
      "FAQ title must contain at most 120 characters.",
    ),

  items: z
    .array(faqItemSchema)
    .min(1, "Add at least one question and answer.")
    .max(100, "FAQ cannot contain more than 100 items."),
});

export type CreateFaqSourceInput = z.input<
  typeof createFaqSourceSchema
>;

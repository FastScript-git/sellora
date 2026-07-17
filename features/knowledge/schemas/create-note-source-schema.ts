import { z } from "zod";

export const createNoteSourceSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required."),

  locale: z.enum(["en", "uk"]),

  title: z
    .string()
    .trim()
    .min(1, "Note title is required.")
    .max(120, "Note title must contain at most 120 characters."),

  content: z
    .string()
    .trim()
    .min(10, "Note must contain at least 10 characters.")
    .max(50_000, "Note must contain at most 50,000 characters."),
});
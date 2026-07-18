import { z } from "zod";

export const reindexKnowledgeSourceSchema = z.object({
  sourceId: z
    .string()
    .trim()
    .min(1, "Knowledge source ID is required."),

  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required."),

  locale: z.enum(["en", "uk"]),
});
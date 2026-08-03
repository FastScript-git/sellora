import { z } from "zod";

export const renameKnowledgeSourceSchema = z.object({
  sourceId: z
    .string()
    .trim()
    .min(1, "Knowledge source ID is required."),

  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required."),

  locale: z
    .string()
    .trim()
    .min(2)
    .max(10),

  title: z
    .string()
    .trim()
    .min(1, "Source title is required.")
    .max(160, "Source title must not exceed 160 characters."),
});

export const deleteKnowledgeSourceSchema = z.object({
  sourceId: z
    .string()
    .trim()
    .min(1, "Knowledge source ID is required."),

  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required."),

  locale: z
    .string()
    .trim()
    .min(2)
    .max(10),
});

export type RenameKnowledgeSourceInput = z.input<
  typeof renameKnowledgeSourceSchema
>;

export type DeleteKnowledgeSourceInput = z.input<
  typeof deleteKnowledgeSourceSchema
>;

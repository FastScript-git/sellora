import { z } from "zod";

export const aiEmployeeCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(60, "Name must contain at most 60 characters"),

  role: z
    .string()
    .trim()
    .min(2, "Role must contain at least 2 characters")
    .max(100, "Role must contain at most 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must contain at most 1000 characters")
    .optional()
    .or(z.literal("")),

  language: z.enum(["EN", "UK"]),

  tone: z.enum([
    "professional",
    "friendly",
    "concise",
    "empathetic",
  ]),
});

export type AIEmployeeCreateInput = z.infer<
  typeof aiEmployeeCreateSchema
>;
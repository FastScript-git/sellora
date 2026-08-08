import { z } from "zod";

import { AIEmployeeLanguage } from "@/lib/generated/prisma/client";

const optionalInstructionField = z
  .string()
  .trim()
  .max(4000, "This field must contain at most 4000 characters")
  .transform((value) => (value.length > 0 ? value : null));

export const updateInstructionsSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  locale: z.enum(["en", "uk"]),

  language: z.nativeEnum(AIEmployeeLanguage),

  tone: z
    .string()
    .trim()
    .max(80, "Tone must contain at most 80 characters")
    .transform((value) => (value.length > 0 ? value : null)),

  identity: optionalInstructionField,
  goals: optionalInstructionField,
  rules: optionalInstructionField,
  responseStyle: optionalInstructionField,
  restrictions: optionalInstructionField,
});

export type UpdateInstructionsInput = z.infer<
  typeof updateInstructionsSchema
>;

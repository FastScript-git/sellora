import { z } from "zod";

const optionalInstructionField = z
  .string()
  .trim()
  .max(4000, "This field must contain at most 4000 characters")
  .transform((value) => (value.length > 0 ? value : null));

export const updateInstructionsSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  locale: z.enum(["en", "uk"]),
  identity: optionalInstructionField,
  goals: optionalInstructionField,
  rules: optionalInstructionField,
  responseStyle: optionalInstructionField,
  restrictions: optionalInstructionField,
});

export type UpdateInstructionsInput = z.infer<
  typeof updateInstructionsSchema
>;
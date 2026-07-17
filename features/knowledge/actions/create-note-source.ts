"use server";

import { createNoteSourceSchema } from "@/features/knowledge/schemas/create-note-source-schema";

export type CreateNoteSourceState = {
  success: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

export async function createNoteSourceAction(
  _previousState: CreateNoteSourceState,
  formData: FormData,
): Promise<CreateNoteSourceState> {
  const parsed = createNoteSourceSchema.safeParse({
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);

      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      success: false,
      message: "Validation failed.",
      fieldErrors,
    };
  }

  return {
    success: true,
    message: "Validation passed.",
    fieldErrors: {},
  };
}
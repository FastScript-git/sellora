"use server";

import { redirect } from "next/navigation";

import { createAIEmployee } from "@/features/ai-employees/service";
import { aiEmployeeCreateSchema } from "@/features/ai-employees/schema";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type CreateAIEmployeeActionState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<
    Record<
      "name" | "role" | "description" | "language" | "tone",
      string
    >
  >;
};

export const initialCreateAIEmployeeState: CreateAIEmployeeActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export async function createAIEmployeeAction(
  _previousState: CreateAIEmployeeActionState,
  formData: FormData,
): Promise<CreateAIEmployeeActionState> {
  const locale = formData.get("locale") === "uk" ? "uk" : "en";

  const parsed = aiEmployeeCreateSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    description: formData.get("description"),
    language: formData.get("language"),
    tone: formData.get("tone"),
  });

  if (!parsed.success) {
    const fieldErrors: CreateAIEmployeeActionState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        field === "name" ||
        field === "role" ||
        field === "description" ||
        field === "language" ||
        field === "tone"
      ) {
        fieldErrors[field] ??= issue.message;
      }
    }

    return {
      success: false,
      message: "Please check the form fields.",
      fieldErrors,
    };
  }

  try {
    const workspace = await getCurrentWorkspace();

    await createAIEmployee({
      workspaceId: workspace.id,
      input: parsed.data,
    });
  } catch (error) {
    console.error("Failed to create AI Employee:", error);

    return {
      success: false,
      message: "Unable to create the AI Employee. Please try again.",
      fieldErrors: {},
    };
  }

  redirect(`/${locale}/dashboard/employees`);
}
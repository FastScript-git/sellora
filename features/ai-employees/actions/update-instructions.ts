"use server";

import { revalidatePath } from "next/cache";

import { updateInstructionsSchema } from "@/features/ai-employees/schemas/update-instructions-schema";
import { updateAIEmployeeInstructions } from "@/features/ai-employees/services/update-ai-employee-instructions";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type UpdateInstructionsActionState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<
    Record<
      | "language"
      | "tone"
      | "identity"
      | "goals"
      | "rules"
      | "responseStyle"
      | "restrictions",
      string
    >
  >;
};

export async function updateInstructionsAction(
  _previousState: UpdateInstructionsActionState,
  formData: FormData,
): Promise<UpdateInstructionsActionState> {
  const parsed = updateInstructionsSchema.safeParse({
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
    language: formData.get("language"),
    tone: formData.get("tone"),
    identity: formData.get("identity"),
    goals: formData.get("goals"),
    rules: formData.get("rules"),
    responseStyle: formData.get("responseStyle"),
    restrictions: formData.get("restrictions"),
  });

  if (!parsed.success) {
    const fieldErrors: UpdateInstructionsActionState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        field === "language" ||
        field === "tone" ||
        field === "identity" ||
        field === "goals" ||
        field === "rules" ||
        field === "responseStyle" ||
        field === "restrictions"
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

    await updateAIEmployeeInstructions({
      employeeId: parsed.data.employeeId,
      workspaceId: workspace.id,
      data: {
        language: parsed.data.language,
        tone: parsed.data.tone,
        identity: parsed.data.identity,
        goals: parsed.data.goals,
        rules: parsed.data.rules,
        responseStyle: parsed.data.responseStyle,
        restrictions: parsed.data.restrictions,
      },
    });

    revalidatePath(
      `/${parsed.data.locale}/dashboard/employees/${parsed.data.employeeId}`,
    );

    revalidatePath(
      `/${parsed.data.locale}/dashboard/employees/${parsed.data.employeeId}/instructions`,
    );

    revalidatePath(
      `/${parsed.data.locale}/dashboard/employees/${parsed.data.employeeId}/settings`,
    );

    return {
      success: true,
      message: "AI Behavior saved successfully.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "Failed to update AI Employee behavior:",
      error,
    );

    return {
      success: false,
      message: "Unable to save AI Behavior. Please try again.",
      fieldErrors: {},
    };
  }
}

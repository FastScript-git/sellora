"use server";

import {
  revalidatePath,
} from "next/cache";
import { z } from "zod";

import { updateWorkspaceName } from "@/features/workspace/repositories/workspace.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const updateWorkspaceSettingsSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Workspace name must contain at least 2 characters.",
      )
      .max(
        80,
        "Workspace name must not exceed 80 characters.",
      ),

    locale: z.enum(["en", "uk"]),
  });

export type UpdateWorkspaceSettingsState = {
  success: boolean;
  message: string | null;
  fieldErrors: {
    name?: string;
  };
};

export async function updateWorkspaceSettingsAction(
  _previousState: UpdateWorkspaceSettingsState,
  formData: FormData,
): Promise<UpdateWorkspaceSettingsState> {
  const parsed =
    updateWorkspaceSettingsSchema.safeParse({
      name: formData.get("name"),
      locale: formData.get("locale"),
    });

  const rawLocale =
    formData.get("locale");

  const locale =
    rawLocale === "uk"
      ? "uk"
      : "en";

  if (!parsed.success) {
    const flattened =
      parsed.error.flatten();

    return {
      success: false,
      message:
        locale === "uk"
          ? "Перевірте введені дані."
          : "Please check the entered data.",

      fieldErrors: {
        name:
          flattened.fieldErrors.name?.[0],
      },
    };
  }

  try {
    const workspace =
      await getCurrentWorkspace();

    const result =
      await updateWorkspaceName({
        workspaceId: workspace.id,
        name: parsed.data.name,
      });

    if (result.count === 0) {
      return {
        success: false,
        message:
          locale === "uk"
            ? "Робочий простір не знайдено."
            : "Workspace was not found.",
        fieldErrors: {},
      };
    }

    revalidatePath(
      `/${locale}/dashboard/settings`,
    );

    revalidatePath(
      `/${locale}/dashboard`,
    );

    return {
      success: true,
      message:
        locale === "uk"
          ? "Налаштування збережено."
          : "Settings saved successfully.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "Failed to update workspace settings:",
      error,
    );

    return {
      success: false,
      message:
        locale === "uk"
          ? "Не вдалося зберегти налаштування."
          : "Failed to save settings.",
      fieldErrors: {},
    };
  }
}

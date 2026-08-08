"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { updateAIEmployeeSettings } from "@/features/ai-employees/repositories/ai-employee-settings.repository";
import { AIEmployeeStatus } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const updateAIEmployeeSettingsSchema =
  z.object({
    employeeId: z
      .string()
      .trim()
      .min(1),

    name: z
      .string()
      .trim()
      .min(2)
      .max(80),

    role: z
      .string()
      .trim()
      .min(2)
      .max(120),

    description: z
      .string()
      .trim()
      .max(1000),

    status: z.nativeEnum(
      AIEmployeeStatus,
    ),

    locale: z.enum(["en", "uk"]),
  });

export type UpdateAIEmployeeSettingsResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<
        string,
        string[] | undefined
      >;
    };

function resolveInputLocale(
  input: unknown,
): "en" | "uk" {
  if (
    typeof input === "object" &&
    input !== null &&
    "locale" in input &&
    input.locale === "uk"
  ) {
    return "uk";
  }

  return "en";
}

export async function updateAIEmployeeSettingsAction(
  input: unknown,
): Promise<UpdateAIEmployeeSettingsResult> {
  const inputLocale =
    resolveInputLocale(input);

  const t = await getTranslations({
    locale: inputLocale,
    namespace:
      "aiEmployeeSettings.messages",
  });

  const parsed =
    updateAIEmployeeSettingsSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      error: t("invalidSettings"),
      fieldErrors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  const {
    employeeId,
    name,
    role,
    description,
    status,
    locale,
  } = parsed.data;

  try {
    const workspace =
      await getCurrentWorkspace();

    const result =
      await updateAIEmployeeSettings({
        employeeId,
        workspaceId: workspace.id,
        name,
        role,
        description:
          description || null,
        status,
      });

    if (result.count === 0) {
      return {
        success: false,
        error: t("notFound"),
      };
    }

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}`,
    );

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}/settings`,
    );

    revalidatePath(
      `/${locale}/dashboard/employees`,
    );

    return {
      success: true,
      message: t("saved"),
    };
  } catch (error) {
    console.error(
      "Failed to update AI Employee settings:",
      error,
    );

    return {
      success: false,
      error: t("saveFailed"),
    };
  }
}

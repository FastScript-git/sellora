"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { archiveAIEmployee } from "@/features/ai-employees/repositories/ai-employee-settings.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const archiveAIEmployeeSchema =
  z.object({
    employeeId: z
      .string()
      .trim()
      .min(1),

    locale: z.enum(["en", "uk"]),
  });

export type ArchiveAIEmployeeResult =
  | {
      success: true;
      redirectTo: string;
    }
  | {
      success: false;
      error: string;
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

export async function archiveAIEmployeeAction(
  input: unknown,
): Promise<ArchiveAIEmployeeResult> {
  const inputLocale =
    resolveInputLocale(input);

  const t = await getTranslations({
    locale: inputLocale,
    namespace:
      "aiEmployeeSettings.messages",
  });

  const parsed =
    archiveAIEmployeeSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      error: t("invalidArchive"),
    };
  }

  const {
    employeeId,
    locale,
  } = parsed.data;

  try {
    const workspace =
      await getCurrentWorkspace();

    const result =
      await archiveAIEmployee({
        employeeId,
        workspaceId: workspace.id,
      });

    if (result.count === 0) {
      return {
        success: false,
        error: t("notFound"),
      };
    }

    revalidatePath(
      `/${locale}/dashboard/employees`,
    );

    return {
      success: true,
      redirectTo:
        `/${locale}/dashboard/employees`,
    };
  } catch (error) {
    console.error(
      "Failed to archive AI Employee:",
      error,
    );

    return {
      success: false,
      error: t("archiveFailed"),
    };
  }
}

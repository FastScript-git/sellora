"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import {
  aiEmployeeToolBelongsToWorkspace,
  updateAIEmployeeTool,
} from "@/features/ai-tools/repositories/ai-tool.repository";
import { AIEmployeeToolKey } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const updateAIEmployeeToolSchema = z.object({
  employeeId: z.string().trim().min(1),
  key: z.nativeEnum(AIEmployeeToolKey),
  isEnabled: z.boolean(),
  locale: z.enum(["en", "uk"]),
});

export type UpdateAIEmployeeToolResult =
  | {
      success: true;
      key: AIEmployeeToolKey;
      isEnabled: boolean;
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

export async function updateAIEmployeeToolAction(
  input: unknown,
): Promise<UpdateAIEmployeeToolResult> {
  const locale = resolveInputLocale(input);

  const t = await getTranslations({
    locale,
    namespace: "aiEmployeeTools.messages",
  });

  const parsed =
    updateAIEmployeeToolSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: t("invalidSettings"),
    };
  }

  const {
    employeeId,
    key,
    isEnabled,
  } = parsed.data;

  try {
    const workspace =
      await getCurrentWorkspace();

    const hasAccess =
      await aiEmployeeToolBelongsToWorkspace({
        employeeId,
        workspaceId: workspace.id,
      });

    if (!hasAccess) {
      return {
        success: false,
        error: t("employeeNotFound"),
      };
    }

    await updateAIEmployeeTool({
      employeeId,
      key,
      isEnabled,
    });

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}/tools`,
    );

    return {
      success: true,
      key,
      isEnabled,
    };
  } catch (error) {
    console.error(
      "Failed to update AI Employee tool:",
      error,
    );

    return {
      success: false,
      error: t("updateFailed"),
    };
  }
}

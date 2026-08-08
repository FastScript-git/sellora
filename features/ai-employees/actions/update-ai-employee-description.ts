"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const updateDescriptionSchema = z.object({
  employeeId: z.string().trim().min(1),
  locale: z.enum(["en", "uk"]),
  description: z
    .string()
    .trim()
    .max(1000),
});

export type UpdateAIEmployeeDescriptionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export async function updateAIEmployeeDescriptionAction(
  input: unknown,
): Promise<UpdateAIEmployeeDescriptionResult> {
  const parsed =
    updateDescriptionSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      error:
        "The description is not valid.",
    };
  }

  const {
    employeeId,
    locale,
    description,
  } = parsed.data;

  try {
    const workspace =
      await getCurrentWorkspace();

    const result =
      await prisma.aIEmployee.updateMany({
        where: {
          id: employeeId,
          workspaceId:
            workspace.id,
          status: {
            not: "ARCHIVED",
          },
        },

        data: {
          description:
            description || null,
        },
      });

    if (result.count === 0) {
      return {
        success: false,
        error:
          "AI Employee was not found.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}`,
    );

    revalidatePath(
      `/${locale}/dashboard/employees`,
    );

    return {
      success: true,
      message:
        locale === "uk"
          ? "Опис збережено."
          : "Description saved.",
    };
  } catch (error) {
    console.error(
      "Failed to update AI Employee description:",
      error,
    );

    return {
      success: false,
      error:
        locale === "uk"
          ? "Не вдалося зберегти опис."
          : "Unable to save the description.",
    };
  }
}

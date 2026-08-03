"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateConversationMode } from "@/features/conversations/repositories/conversation.repository";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const updateConversationModeSchema = z.object({
  conversationId: z.string().trim().min(1),
  mode: z.enum(["AI", "HUMAN"]),
  locale: z.enum(["en", "uk"]),
});

export type UpdateConversationModeResult =
  | {
      success: true;
      mode: "AI" | "HUMAN";
    }
  | {
      success: false;
      error: string;
    };

export async function updateConversationModeAction(
  input: unknown,
): Promise<UpdateConversationModeResult> {
  const parsed =
    updateConversationModeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid conversation mode data.",
    };
  }

  const {
    conversationId,
    mode,
    locale,
  } = parsed.data;

  try {
    const workspace =
      await getCurrentWorkspace();

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,

          employee: {
            workspaceId: workspace.id,
          },
        },

        select: {
          id: true,
          employeeId: true,
        },
      });

    if (!conversation) {
      return {
        success: false,
        error:
          locale === "uk"
            ? "Розмову не знайдено."
            : "Conversation was not found.",
      };
    }

    const result =
      await updateConversationMode({
        conversationId:
          conversation.id,
        employeeId:
          conversation.employeeId,
        mode,
      });

    if (result.count === 0) {
      return {
        success: false,
        error:
          locale === "uk"
            ? "Не вдалося змінити режим розмови."
            : "Conversation mode could not be updated.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/conversations`,
    );

    return {
      success: true,
      mode,
    };
  } catch (error) {
    console.error(
      "Failed to update conversation mode:",
      error,
    );

    return {
      success: false,
      error:
        locale === "uk"
          ? "Не вдалося змінити режим розмови."
          : "Failed to update conversation mode.",
    };
  }
}

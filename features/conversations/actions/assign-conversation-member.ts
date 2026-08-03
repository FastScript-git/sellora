"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assignConversationMember } from "@/features/conversations/repositories/conversation.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

const assignConversationMemberSchema = z.object({
  conversationId: z
    .string()
    .trim()
    .min(1),

  assignedMemberId: z
    .string()
    .trim()
    .nullable(),

  locale: z.enum(["en", "uk"]),
});

export type AssignConversationMemberResult =
  | {
      success: true;
      assignedMemberId: string | null;
    }
  | {
      success: false;
      error: string;
    };

export async function assignConversationMemberAction(
  input: unknown,
): Promise<AssignConversationMemberResult> {
  const parsed =
    assignConversationMemberSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      error:
        "Invalid conversation assignment data.",
    };
  }

  const {
    conversationId,
    assignedMemberId,
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

    if (assignedMemberId) {
      const member =
        await prisma.workspaceMember.findFirst({
          where: {
            id: assignedMemberId,
            workspaceId: workspace.id,
          },

          select: {
            id: true,
          },
        });

      if (!member) {
        return {
          success: false,
          error:
            locale === "uk"
              ? "Учасника робочого простору не знайдено."
              : "Workspace member was not found.",
        };
      }
    }

    const result =
      await assignConversationMember({
        conversationId:
          conversation.id,

        employeeId:
          conversation.employeeId,

        assignedMemberId,
      });

    if (result.count === 0) {
      return {
        success: false,
        error:
          locale === "uk"
            ? "Не вдалося призначити оператора."
            : "Conversation could not be assigned.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/conversations`,
    );

    return {
      success: true,
      assignedMemberId,
    };
  } catch (error) {
    console.error(
      "Failed to assign conversation member:",
      error,
    );

    return {
      success: false,
      error:
        locale === "uk"
          ? "Не вдалося призначити оператора."
          : "Failed to assign the conversation.",
    };
  }
}

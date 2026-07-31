import {
  ConversationRole,
  type Prisma,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getConversationMessages({
  conversationId,
}: {
  conversationId: string;
}) {
  return prisma.conversationMessage.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}

type CreateWorkspaceConversationMessageParams = {
  workspaceId: string;
  conversationId: string;
  content: string;
  role?: ConversationRole;
  metadata?: Prisma.InputJsonValue;
};

export async function createWorkspaceConversationMessage({
  workspaceId,
  conversationId,
  content,
  role = ConversationRole.ASSISTANT,
  metadata,
}: CreateWorkspaceConversationMessageParams) {
  return prisma.$transaction(async (transaction) => {
    const conversation =
      await transaction.conversation.findFirst({
        where: {
          id: conversationId,
          employee: {
            workspaceId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (!conversation) {
      return null;
    }

    const createdAt = new Date();

    const message =
      await transaction.conversationMessage.create({
        data: {
          conversationId,
          role,
          content,
          createdAt,
          ...(metadata !== undefined
            ? {
                metadata,
              }
            : {}),
        },
        select: {
          id: true,
          conversationId: true,
          role: true,
          content: true,
          metadata: true,
          createdAt: true,
        },
      });

    await transaction.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: createdAt,
      },
    });

    return message;
  });
}

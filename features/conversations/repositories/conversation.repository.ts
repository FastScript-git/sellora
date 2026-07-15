import { ConversationRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CreateConversationParams = {
  employeeId: string;
  title?: string | null;
};

export async function createConversation({
  employeeId,
  title,
}: CreateConversationParams) {
  return prisma.conversation.create({
    data: {
      employeeId,
      title,
    },
  });
}

type CreateConversationMessageParams = {
  conversationId: string;
  role: ConversationRole;
  content: string;
};

export async function createConversationMessage({
  conversationId,
  role,
  content,
}: CreateConversationMessageParams) {
  return prisma.conversationMessage.create({
    data: {
      conversationId,
      role,
      content,
    },
  });
}

export async function getConversationWithMessages(
  conversationId: string,
) {
  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
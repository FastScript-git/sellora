import { ConversationRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CreateConversationParams = {
  employeeId: string;
  contactId?: string | null;
  title?: string | null;
};

export async function createConversation({
  employeeId,
  contactId,
  title,
}: CreateConversationParams) {
  return prisma.conversation.create({
    data: {
      employeeId,
      contactId,
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

type GetEmployeeConversationParams = {
  conversationId: string;
  employeeId: string;
};

export async function getEmployeeConversation({
  conversationId,
  employeeId,
}: GetEmployeeConversationParams) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      employeeId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
}

export async function getConversationsByEmployee(
  employeeId: string,
) {
  return prisma.conversation.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
}
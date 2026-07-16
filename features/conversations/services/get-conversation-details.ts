import { prisma } from "@/lib/prisma";

type GetConversationDetailsParams = {
  conversationId: string;
  employeeId: string;
  workspaceId: string;
};

export async function getConversationDetails({
  conversationId,
  employeeId,
  workspaceId,
}: GetConversationDetailsParams) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      employeeId,
      employee: {
        workspaceId,
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          sentiment: true,
          leadScore: true,
          summary: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
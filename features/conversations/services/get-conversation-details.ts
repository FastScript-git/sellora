import { prisma } from "@/lib/prisma";

export async function getConversationDetails({
  conversationId,
  workspaceId,
}: {
  conversationId: string;
  workspaceId: string;
}) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
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
import { prisma } from "@/lib/prisma";

type GetWorkspaceInboxParams = {
  workspaceId: string;
};

export async function getWorkspaceInbox({
  workspaceId,
}: GetWorkspaceInboxParams) {
  return prisma.conversation.findMany({
    where: {
      employee: {
        workspaceId,
      },
    },

    orderBy: [
      {
        lastMessageAt: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],

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
          company: true,
          sentiment: true,
          leadScore: true,
        },
      },

      channel: {
        select: {
          id: true,
          type: true,
          name: true,
        },
      },

      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
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
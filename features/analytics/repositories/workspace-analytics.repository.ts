import { prisma } from "@/lib/prisma";

export async function getWorkspaceAnalytics(
  workspaceId: string,
) {
  const [
    aiEmployees,
    activeEmployees,
    conversations,
    messages,
    contacts,
    knowledgeSources,
    websiteChannels,
  ] = await Promise.all([
    prisma.aIEmployee.count({
      where: {
        workspaceId,
      },
    }),

    prisma.aIEmployee.count({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
    }),

    prisma.conversation.count({
      where: {
        employee: {
          workspaceId,
        },
      },
    }),

    prisma.conversationMessage.count({
      where: {
        conversation: {
          employee: {
            workspaceId,
          },
        },
      },
    }),

    prisma.contact.count({
      where: {
        workspaceId,
      },
    }),

    prisma.knowledgeSource.count({
      where: {
        employee: {
          workspaceId,
        },
      },
    }),

    prisma.channel.count({
      where: {
        employee: {
          workspaceId,
        },
        type: "WEBSITE",
        isEnabled: true,
      },
    }),
  ]);

  return {
    aiEmployees,
    activeEmployees,
    conversations,
    messages,
    contacts,
    knowledgeSources,
    websiteChannels,
  };
}
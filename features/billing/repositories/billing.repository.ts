import { prisma } from "@/lib/prisma";

type GetWorkspaceBillingUsageParams = {
  workspaceId: string;
};

export async function getWorkspaceBillingUsage({
  workspaceId,
}: GetWorkspaceBillingUsageParams) {
  const [
    aiEmployees,
    contacts,
    workflows,
    conversations,
    messages,
    knowledgeSources,
    channels,
  ] = await Promise.all([
    prisma.aIEmployee.count({
      where: {
        workspaceId,
        status: {
          not: "ARCHIVED",
        },
      },
    }),

    prisma.contact.count({
      where: {
        workspaceId,
      },
    }),

    prisma.workflow.count({
      where: {
        workspaceId,
        status: {
          not: "ARCHIVED",
        },
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
      },
    }),
  ]);

  return {
    aiEmployees,
    contacts,
    workflows,
    conversations,
    messages,
    knowledgeSources,
    channels,
  };
}

import { prisma } from "@/lib/prisma";

export async function getEmployeeAnalytics(
  employeeId: string,
) {
  const [
    conversations,
    messages,
    contacts,
    knowledgeSources,
  ] = await Promise.all([
    prisma.conversation.count({
      where: {
        employeeId,
      },
    }),

    prisma.conversationMessage.count({
      where: {
        conversation: {
          employeeId,
        },
      },
    }),

    prisma.contact.count({
      where: {
        conversations: {
          some: {
            employeeId,
          },
        },
      },
    }),

    prisma.knowledgeSource.count({
      where: {
        employeeId,
      },
    }),
  ]);

  return {
    conversations,
    messages,
    contacts,
    knowledgeSources,
  };
}
import { prisma } from "@/lib/prisma";

export async function getRecentEmployeeConversations(
  employeeId: string,
) {
  return prisma.conversation.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
    include: {
      contact: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
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
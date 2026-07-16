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
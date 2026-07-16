import { prisma } from "@/lib/prisma";

type UpdateContactIntelligenceParams = {
  contactId: string;
};

export async function updateContactIntelligence({
  contactId,
}: UpdateContactIntelligenceParams) {
  const contact = await prisma.contact.findUnique({
    where: {
      id: contactId,
    },
    include: {
      conversations: {
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!contact) {
    return;
  }

  const lastConversation = contact.conversations[0];

  await prisma.contact.update({
    where: {
      id: contact.id,
    },
    data: {
      lastInteractionAt:
        lastConversation?.updatedAt ?? new Date(),
    },
  });
}
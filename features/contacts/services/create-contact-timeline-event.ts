import type { Prisma } from "@/lib/generated/prisma/client";
import type { ContactTimelineEventType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type CreateContactTimelineEventInput = {
  workspaceId: string;
  contactId: string;
  type: ContactTimelineEventType;
  title: string;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function createContactTimelineEvent({
  workspaceId,
  contactId,
  type,
  title,
  description,
  metadata,
}: CreateContactTimelineEventInput): Promise<void> {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return;
  }

  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      workspaceId,
    },

    select: {
      id: true,
    },
  });

  if (!contact) {
    return;
  }

  await prisma.contactTimelineEvent.create({
    data: {
      contactId: contact.id,
      type,
      title: normalizedTitle,
      description:
        description?.trim() || null,

      ...(metadata !== undefined
        ? {
            metadata,
          }
        : {}),
    },
  });
}
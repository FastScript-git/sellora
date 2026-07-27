import { createContactTimelineEvent } from "@/features/contacts/services/create-contact-timeline-event";
import { prisma } from "@/lib/prisma";

type UpdateContactSummaryInput = {
  workspaceId: string;
  contactId: string;
  summary: string | null;
};

export type UpdateContactSummaryResult = {
  updated: boolean;
};

function normalizeSummary(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.slice(0, 2_000);
}

export async function updateContactSummary({
  workspaceId,
  contactId,
  summary,
}: UpdateContactSummaryInput): Promise<UpdateContactSummaryResult> {
  const normalizedSummary =
    normalizeSummary(summary);

  if (!normalizedSummary) {
    return {
      updated: false,
    };
  }

  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      workspaceId,
    },

    select: {
      id: true,
      summary: true,
    },
  });

  if (!contact) {
    return {
      updated: false,
    };
  }

  if (contact.summary === normalizedSummary) {
    return {
      updated: false,
    };
  }

  await prisma.contact.update({
    where: {
      id: contact.id,
    },

    data: {
      summary: normalizedSummary,
    },
  });

  await createContactTimelineEvent({
    workspaceId,
    contactId,
    type: "AI_SUMMARY_UPDATED",
    title: "Conversation summary updated",
    description: normalizedSummary,
    metadata: {
      source: "AI_CONVERSATION_SUMMARY",
      previousSummary:
        contact.summary ?? null,
      newSummary: normalizedSummary,
    },
  });

  return {
    updated: true,
  };
}
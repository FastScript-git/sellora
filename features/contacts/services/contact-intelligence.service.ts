import {
  ContactSentiment,
  type ConversationRole,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { generateContactSummary } from "@/features/contacts/services/generate-contact-summary";

const MAX_MESSAGES_FOR_ANALYSIS = 80;
const MAX_CONVERSATION_LENGTH = 24_000;

type UpdateContactIntelligenceParams = {
  contactId: string;
};

function formatConversationMessage({
  role,
  content,
}: {
  role: ConversationRole;
  content: string;
}) {
  const speaker = role === "USER" ? "Customer" : "AI Employee";

  return `${speaker}: ${content.trim()}`;
}

function buildConversationTranscript(
  conversations: Array<{
    messages: Array<{
      role: ConversationRole;
      content: string;
      createdAt: Date;
    }>;
  }>,
) {
  const messages = conversations
    .flatMap((conversation) => conversation.messages)
    .sort(
      (firstMessage, secondMessage) =>
        firstMessage.createdAt.getTime() -
        secondMessage.createdAt.getTime(),
    )
    .slice(-MAX_MESSAGES_FOR_ANALYSIS);

  const transcript = messages
    .map(formatConversationMessage)
    .join("\n\n")
    .trim();

  if (transcript.length <= MAX_CONVERSATION_LENGTH) {
    return transcript;
  }

  return transcript.slice(-MAX_CONVERSATION_LENGTH);
}

export async function updateContactIntelligence({
  contactId,
}: UpdateContactIntelligenceParams) {
  const normalizedContactId = contactId.trim();

  if (!normalizedContactId) {
    return {
      success: false as const,
      reason: "CONTACT_ID_REQUIRED" as const,
    };
  }

  const contact = await prisma.contact.findUnique({
    where: {
      id: normalizedContactId,
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
            select: {
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!contact) {
    return {
      success: false as const,
      reason: "CONTACT_NOT_FOUND" as const,
    };
  }

  const lastConversation = contact.conversations[0];

  const lastInteractionAt =
    lastConversation?.messages.at(-1)?.createdAt ??
    lastConversation?.updatedAt ??
    contact.updatedAt;

  const conversation = buildConversationTranscript(
    contact.conversations,
  );

  if (!conversation) {
    await prisma.contact.update({
      where: {
        id: contact.id,
      },
      data: {
        lastInteractionAt,
      },
    });

    return {
      success: true as const,
      analyzed: false as const,
    };
  }

  try {
    const intelligence = await generateContactSummary({
      conversation,
    });

    await prisma.contact.update({
      where: {
        id: contact.id,
      },
      data: {
        summary: intelligence.summary,
        sentiment: ContactSentiment[intelligence.sentiment],
        leadScore: intelligence.leadScore,
        tags: intelligence.tags,
        nextAction: intelligence.nextAction,
        lastInteractionAt,
      },
    });

    return {
      success: true as const,
      analyzed: true as const,
    };
  } catch (error) {
    console.error("Failed to update contact intelligence:", {
      contactId: contact.id,
      error,
    });

    await prisma.contact.update({
      where: {
        id: contact.id,
      },
      data: {
        lastInteractionAt,
      },
    });

    return {
      success: false as const,
      reason: "AI_ANALYSIS_FAILED" as const,
    };
  }
}
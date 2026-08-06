import { generateResponse } from "@/features/ai/services/generate-response";
import { prepareConversationResponse } from "@/features/ai/services/prepare-conversation-response";
import { prisma } from "@/lib/prisma";

type GenerateConversationResponseParams = {
  conversationId: string;
  userMessageId: string;
};

export async function generateConversationResponse({
  conversationId,
  userMessageId,
}: GenerateConversationResponseParams) {
  const prepared =
    await prepareConversationResponse({
      conversationId,
      userMessageId,
    });

  const generatedContent = (
    await generateResponse({
      prompt: prepared.prompt,
    })
  ).trim();

  if (!generatedContent) {
    throw new Error(
      "AI_EMPTY_RESPONSE",
    );
  }

  return prisma.$transaction(
    async (transaction) => {
      const assistantMessage =
        await transaction.conversationMessage.create({
          data: {
            conversationId:
              prepared.conversationId,
            role: "ASSISTANT",
            content:
              generatedContent,

            metadata: {
              source: "OPENAI",
              knowledgeSources:
                prepared.knowledgeSources,
            },
          },

          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        });

      await transaction.conversation.update({
        where: {
          id:
            prepared.conversationId,
        },

        data: {
          lastMessageAt:
            assistantMessage.createdAt,
        },
      });

      return assistantMessage;
    },
  );
}

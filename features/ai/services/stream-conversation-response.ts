import { randomUUID } from "node:crypto";

import { generateStreamingResponse } from "@/features/ai/services/generate-response";
import { prepareConversationResponse } from "@/features/ai/services/prepare-conversation-response";
import type { AIStreamEvent } from "@/features/ai/streaming/stream-events";
import { prisma } from "@/lib/prisma";

type StreamConversationResponseParams = {
  conversationId: string;
  userMessageId: string;
  excludedMessageIds?: string[];
  signal?: AbortSignal;
  onEvent: (
    event: AIStreamEvent,
  ) => void | Promise<void>;
};

export type StreamConversationResponseResult = {
  conversationId: string;

  assistantMessage: {
    id: string;
    content: string;
    createdAt: Date;
  };

  debug: {
    model: string;
    latencyMs: number;

    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };

    knowledgeSources: number;
  };
};

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" ||
      error.message === "The operation was aborted.")
  );
}

export async function streamConversationResponse({
  conversationId,
  userMessageId,
  excludedMessageIds,
  signal,
  onEvent,
}: StreamConversationResponseParams): Promise<StreamConversationResponseResult> {
  const prepared =
    await prepareConversationResponse({
      conversationId,
      userMessageId,
      excludedMessageIds,
    });

  const streamingMessageId =
    `stream-${randomUUID()}`;

  const startedAt =
    new Date().toISOString();

  await onEvent({
    type: "assistant_message_started",
    messageId: streamingMessageId,
    createdAt: startedAt,
  });

  try {
    const generated =
      await generateStreamingResponse({
        prompt: prepared.prompt,
        signal,

        onDelta: async (delta) => {
          await onEvent({
            type: "delta",
            messageId:
              streamingMessageId,
            delta,
          });
        },
      });

    const assistantMessage =
      await prisma.$transaction(
        async (transaction) => {
          const createdMessage =
            await transaction.conversationMessage.create({
              data: {
                conversationId:
                  prepared.conversationId,

                role: "ASSISTANT",
                content: generated.text,

                metadata: {
                  source: "OPENAI",
                  model:
                    generated.model,

                  latencyMs:
                    generated.latencyMs,

                  usage:
                    generated.usage,

                  knowledgeSources:
                    prepared.knowledgeSources,
                },
              },

              select: {
                id: true,
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
                createdMessage.createdAt,
            },
          });

          return createdMessage;
        },
      );

    await onEvent({
      type: "assistant_message",
      message: {
        id: assistantMessage.id,
        content:
          assistantMessage.content,
        createdAt:
          assistantMessage.createdAt.toISOString(),
      },

      citations:
        prepared.knowledgeSources.map(
          (source, index) => ({
            sourceId:
              source.knowledgeSourceId,

            sourceTitle:
              source.sourceTitle,

            citationNumbers: [
              index + 1,
            ],
          }),
        ),
    });

    await onEvent({
      type: "debug",
      model: generated.model,
      latencyMs:
        generated.latencyMs,
      usage:
        generated.usage,
      knowledgeSources:
        prepared.knowledgeSources.length,
    });

    await onEvent({
      type: "done",
      conversationId:
        prepared.conversationId,
    });

    return {
      conversationId:
        prepared.conversationId,

      assistantMessage,

      debug: {
        model: generated.model,
        latencyMs:
          generated.latencyMs,
        usage:
          generated.usage,
        knowledgeSources:
          prepared.knowledgeSources.length,
      },
    };
  } catch (error) {
    const aborted =
      isAbortError(error) ||
      signal?.aborted === true;

    await onEvent({
      type: "error",

      error: aborted
        ? "Response generation was stopped."
        : "Unable to generate the AI response.",

      code: aborted
        ? "AI_STREAM_ABORTED"
        : "AI_STREAM_FAILED",

      conversationId:
        prepared.conversationId,
    });

    throw error;
  }
}

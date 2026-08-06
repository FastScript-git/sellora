import { NextResponse } from "next/server";

import { streamConversationResponse } from "@/features/ai/services/stream-conversation-response";
import {
  createAIStreamHeaders,
  encodeAIStreamEvent,
} from "@/features/ai/streaming/stream-events";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RegenerateRouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RegenerateRouteContext,
): Promise<Response> {
  try {
    const { conversationId } =
      await context.params;

    const normalizedConversationId =
      conversationId.trim();

    if (!normalizedConversationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Conversation ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const workspace =
      await getCurrentWorkspace();

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: normalizedConversationId,

          employee: {
            workspaceId:
              workspace.id,
          },
        },

        select: {
          id: true,

          messages: {
            orderBy: {
              createdAt: "desc",
            },

            take: 50,

            select: {
              id: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Conversation was not found.",
        },
        {
          status: 404,
        },
      );
    }

    const latestAssistantIndex =
      conversation.messages.findIndex(
        (message) =>
          message.role ===
          "ASSISTANT",
      );

    if (latestAssistantIndex < 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This conversation does not contain an AI response to regenerate.",
        },
        {
          status: 409,
        },
      );
    }

    const latestAssistantMessage =
      conversation.messages[
        latestAssistantIndex
      ];

    const previousUserMessage =
      conversation.messages
        .slice(
          latestAssistantIndex + 1,
        )
        .find(
          (message) =>
            message.role === "USER",
        );

    if (!previousUserMessage) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No customer message was found before the AI response.",
        },
        {
          status: 409,
        },
      );
    }

    const newerBlockingMessage =
      conversation.messages
        .slice(
          0,
          latestAssistantIndex,
        )
        .find(
          (message) =>
            message.role === "USER" ||
            message.role === "OPERATOR",
        );

    if (newerBlockingMessage) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only the latest AI response can be regenerated.",
        },
        {
          status: 409,
        },
      );
    }

    const stream =
      new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            controller.enqueue(
              encodeAIStreamEvent({
                type: "conversation",
                conversationId:
                  normalizedConversationId,
              }),
            );

            await streamConversationResponse({
              conversationId:
                normalizedConversationId,

              userMessageId:
                previousUserMessage.id,

              excludedMessageIds: [
                latestAssistantMessage.id,
              ],

              signal:
                request.signal,

              onEvent: async (
                event,
              ) => {
                if (
                  event.type ===
                  "assistant_message"
                ) {
                  await prisma.conversationMessage.deleteMany({
                    where: {
                      id:
                        latestAssistantMessage.id,

                      conversationId:
                        normalizedConversationId,

                      role:
                        "ASSISTANT",
                    },
                  });
                }

                controller.enqueue(
                  encodeAIStreamEvent(
                    event,
                  ),
                );
              },
            });
          } catch (error) {
            console.error(
              "Failed to regenerate AI response:",
              error,
            );
          } finally {
            controller.close();
          }
        },
      });

    return new Response(stream, {
      status: 200,
      headers:
        createAIStreamHeaders(),
    });
  } catch (error) {
    console.error(
      "Failed to start AI response regeneration:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to regenerate the AI response.",
      },
      {
        status: 500,
      },
    );
  }
}

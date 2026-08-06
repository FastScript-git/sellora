import { NextResponse } from "next/server";

import { generateConversationResponse } from "@/features/ai/services/generate-conversation-response";
import { streamConversationResponse } from "@/features/ai/services/stream-conversation-response";
import { processWidgetMessage } from "@/features/ai/services/process-widget-message";
import {
  createAIStreamHeaders,
  encodeAIStreamEvent,
} from "@/features/ai/streaming/stream-events";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConversationAIReplyRouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

type AIReplyRequestBody = {
  stream?: boolean;
};

function getAIErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return "Failed to generate AI reply.";
  }

  switch (error.message) {
    case "AI_CONVERSATION_NOT_FOUND":
      return "Conversation was not found.";

    case "AI_EMPLOYEE_NOT_ACTIVE":
      return "The AI employee must be active before generating replies.";

    case "AI_USER_MESSAGE_NOT_FOUND":
      return "No valid customer message was found.";

    case "AI_EMPTY_RESPONSE":
      return "The AI employee generated an empty response.";

    default:
      return "Failed to generate AI reply.";
  }
}

async function shouldStreamResponse(
  request: Request,
) {
  const accept =
    request.headers.get("accept");

  if (
    accept?.includes(
      "application/x-ndjson",
    )
  ) {
    return true;
  }

  const rawBody =
    await request.text();

  if (!rawBody.trim()) {
    return false;
  }

  try {
    const body =
      JSON.parse(
        rawBody,
      ) as AIReplyRequestBody;

    return body.stream === true;
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  context: ConversationAIReplyRouteContext,
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
          contactId: true,
          status: true,

          messages: {
            where: {
              role: "USER",
            },

            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              id: true,
              content: true,
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

    const latestUserMessage =
      conversation.messages[0];

    if (!latestUserMessage) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This conversation does not contain a customer message.",
        },
        {
          status: 409,
        },
      );
    }

    const existingAssistantReply =
      await prisma.conversationMessage.findFirst({
        where: {
          conversationId:
            normalizedConversationId,

          role: "ASSISTANT",

          createdAt: {
            gt:
              latestUserMessage.createdAt,
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
        },
      });

    if (existingAssistantReply) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The latest customer message already has a reply.",
        },
        {
          status: 409,
        },
      );
    }

    const wantsStream =
      await shouldStreamResponse(
        request,
      );

    if (wantsStream) {
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
                  latestUserMessage.id,

                signal:
                  request.signal,

                onEvent: async (
                  event,
                ) => {
                  controller.enqueue(
                    encodeAIStreamEvent(
                      event,
                    ),
                  );
                },
              });
            } catch (error) {
              console.error(
                "Failed to stream conversation AI reply:",
                error,
              );
            } finally {
              controller.close();
            }
          },

          cancel() {
            console.info(
              "Conversation AI stream was cancelled:",
              {
                conversationId:
                  normalizedConversationId,
              },
            );
          },
        });

      return new Response(
        stream,
        {
          status: 200,
          headers:
            createAIStreamHeaders(),
        },
      );
    }

    if (conversation.contactId) {
      const result =
        await processWidgetMessage({
          workspaceId:
            workspace.id,

          contactId:
            conversation.contactId,

          conversationId:
            normalizedConversationId,

          userMessageId:
            latestUserMessage.id,

          content:
            latestUserMessage.content,
        });

      if (!result.assistantMessage) {
        return NextResponse.json(
          {
            success: false,
            error:
              result.warning ??
              "The AI employee could not generate a response.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        success: true,
        message:
          result.assistantMessage,
        warning:
          result.warning,
      });
    }

    const assistantMessage =
      await generateConversationResponse({
        conversationId:
          normalizedConversationId,

        userMessageId:
          latestUserMessage.id,
      });

    return NextResponse.json({
      success: true,
      message:
        assistantMessage,

      warning:
        "CRM enrichment was skipped because this conversation has no contact.",
    });
  } catch (error) {
    console.error(
      "Failed to generate conversation AI reply:",
      error,
    );

    const message =
      getAIErrorMessage(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          error instanceof Error &&
          error.message ===
            "AI_EMPLOYEE_NOT_ACTIVE"
            ? 409
            : 500,
      },
    );
  }
}

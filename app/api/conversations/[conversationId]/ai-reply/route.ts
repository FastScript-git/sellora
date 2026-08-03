import { NextResponse } from "next/server";

import { generateConversationResponse } from "@/features/ai/services/generate-conversation-response";
import { processWidgetMessage } from "@/features/ai/services/process-widget-message";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConversationAIReplyRouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

function getAIErrorMessage(error: unknown): string {
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

export async function POST(
  _request: Request,
  context: ConversationAIReplyRouteContext,
): Promise<NextResponse> {
  try {
    const { conversationId } = await context.params;

    if (!conversationId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const workspace = await getCurrentWorkspace();

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          employee: {
            workspaceId: workspace.id,
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
          error: "Conversation was not found.",
        },
        {
          status: 404,
        },
      );
    }

    const latestUserMessage = conversation.messages[0];

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
          conversationId,
          role: "ASSISTANT",
          createdAt: {
            gt: latestUserMessage.createdAt,
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

    if (conversation.contactId) {
      const result = await processWidgetMessage({
        workspaceId: workspace.id,
        contactId: conversation.contactId,
        conversationId,
        userMessageId: latestUserMessage.id,
        content: latestUserMessage.content,
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
        message: result.assistantMessage,
        warning: result.warning,
      });
    }

    const assistantMessage =
      await generateConversationResponse({
        conversationId,
        userMessageId: latestUserMessage.id,
      });

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      warning:
        "CRM enrichment was skipped because this conversation has no contact.",
    });
  } catch (error) {
    console.error(
      "Failed to generate conversation AI reply:",
      error,
    );

    const message = getAIErrorMessage(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          error instanceof Error &&
          error.message === "AI_EMPLOYEE_NOT_ACTIVE"
            ? 409
            : 500,
      },
    );
  }
}

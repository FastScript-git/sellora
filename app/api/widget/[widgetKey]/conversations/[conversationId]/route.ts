import { NextResponse } from "next/server";

import { getWidgetMessageCitations } from "@/features/widget/lib/widget-message-citations";
import { prisma } from "@/lib/prisma";

const MESSAGE_HISTORY_LIMIT = 100;

type RouteContext = {
  params: Promise<{
    widgetKey: string;
    conversationId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { widgetKey, conversationId } =
      await context.params;

    const normalizedWidgetKey = widgetKey.trim();
    const normalizedConversationId =
      conversationId.trim();

    if (!normalizedWidgetKey) {
      return NextResponse.json(
        {
          error: "Widget key is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!normalizedConversationId) {
      return NextResponse.json(
        {
          error: "Conversation ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: normalizedConversationId,

          channel: {
            widgetKey: normalizedWidgetKey,
            type: "WEBSITE",
            isEnabled: true,
          },
        },

        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          employee: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },

          channel: {
            select: {
              id: true,
              name: true,
              widgetTitle: true,
              widgetGreeting: true,
              widgetPrimaryColor: true,
            },
          },

          messages: {
            take: MESSAGE_HISTORY_LIMIT,

            orderBy: {
              createdAt: "desc",
            },

            select: {
              id: true,
              role: true,
              content: true,
              metadata: true,
              createdAt: true,
            },
          },
        },
      });

    if (!conversation) {
      return NextResponse.json(
        {
          error:
            "Conversation was not found for this widget.",
        },
        {
          status: 404,
        },
      );
    }

    if (conversation.employee.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "The AI employee assigned to this conversation is not active.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json({
      data: {
        conversation: {
          id: conversation.id,
          status: conversation.status,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },

        employee: conversation.employee,

        channel: conversation.channel,

        messages: conversation.messages
          .reverse()
          .map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,

            citations:
              getWidgetMessageCitations(
                message.metadata,
              ),
          })),
      },
    });
  } catch (error) {
    console.error(
      "Failed to load website widget conversation:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while loading the conversation.",
      },
      {
        status: 500,
      },
    );
  }
}
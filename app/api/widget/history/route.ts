import { NextResponse } from "next/server";

import { validateWidgetRequest } from "@/features/channels/services/validate-widget-request";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY_MESSAGES = 100;

function getCorsHeaders(request?: Request) {
  const origin = request?.headers.get("origin");

  return {
    "Access-Control-Allow-Origin":
      origin && origin !== "null"
        ? origin
        : "*",
    "Access-Control-Allow-Methods":
      "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  request?: Request,
) {
  return NextResponse.json(body, {
    status,
    headers: getCorsHeaders(request),
  });
}

export async function OPTIONS(
  request: Request,
) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const widgetKey =
    requestUrl.searchParams
      .get("widgetKey")
      ?.trim() ?? "";

  const conversationId =
    requestUrl.searchParams
      .get("conversationId")
      ?.trim() ?? "";

  if (!widgetKey) {
    return jsonResponse(
      {
        success: false,
        error: "Widget key is required.",
      },
      400,
      request,
    );
  }

  if (!conversationId) {
    return jsonResponse(
      {
        success: false,
        error: "Conversation ID is required.",
      },
      400,
      request,
    );
  }

  try {
    const validation =
      await validateWidgetRequest({
        request,
        widgetKey,
      });

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          error: validation.error,
          code: validation.code,
        },
        validation.status,
        request,
      );
    }

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          employeeId:
            validation.channel.employee.id,
        },

        select: {
          id: true,

          messages: {
            orderBy: {
              createdAt: "asc",
            },

            take: MAX_HISTORY_MESSAGES,

            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      });

    if (!conversation) {
      return jsonResponse(
        {
          success: false,
          error:
            "Conversation was not found.",
        },
        404,
        request,
      );
    }

    const messages = conversation.messages
      .filter(
        (message) =>
          message.role === "USER" ||
          message.role === "ASSISTANT",
      )
      .map((message) => ({
        id: message.id,
        role:
          message.role === "USER"
            ? ("user" as const)
            : ("employee" as const),
        content: message.content,
        createdAt:
          message.createdAt.toISOString(),
      }));

    return jsonResponse(
      {
        success: true,
        conversationId: conversation.id,
        messages,
      },
      200,
      request,
    );
  } catch (error) {
    console.error(
      "[Widget History API] Failed to load conversation history.",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Conversation history could not be loaded.",
      },
      500,
      request,
    );
  }
}

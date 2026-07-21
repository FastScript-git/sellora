import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY_MESSAGES = 100;

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: getCorsHeaders(),
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const widgetKey =
    requestUrl.searchParams.get("widgetKey")?.trim() ?? "";

  const conversationId =
    requestUrl.searchParams.get("conversationId")?.trim() ?? "";

  if (!widgetKey) {
    return jsonResponse(
      {
        success: false,
        error: "Widget key is required.",
      },
      400,
    );
  }

  if (!conversationId) {
    return jsonResponse(
      {
        success: false,
        error: "Conversation ID is required.",
      },
      400,
    );
  }

  try {
    const channel = await prisma.channel.findUnique({
      where: {
        widgetKey,
      },
      select: {
        type: true,
        isEnabled: true,
        employee: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (
      !channel ||
      channel.type !== "WEBSITE" ||
      !channel.isEnabled ||
      channel.employee.status !== "ACTIVE"
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Widget was not found or is unavailable.",
        },
        404,
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        employeeId: channel.employee.id,
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
          error: "Conversation was not found.",
        },
        404,
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
        createdAt: message.createdAt.toISOString(),
      }));

    return jsonResponse({
      success: true,
      conversationId: conversation.id,
      messages,
    });
  } catch (error) {
    console.error(
      "[Widget History API] Failed to load conversation history.",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error: "Conversation history could not be loaded.",
      },
      500,
    );
  }
}
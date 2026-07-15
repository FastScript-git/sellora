import { NextResponse } from "next/server";

import { buildPrompt } from "@/features/ai/services/build-prompt";
import { generateResponse } from "@/features/ai/services/generate-response";
import {
  getConversationHistory,
  saveAssistantMessage,
  saveUserMessage,
  startConversation,
} from "@/features/conversations/services/conversation.service";
import { searchKnowledge } from "@/features/knowledge/services/search-knowledge";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 4000;
const KNOWLEDGE_RESULT_LIMIT = 5;
const CONVERSATION_HISTORY_LIMIT = 20;

type WidgetChatBody = {
  widgetKey?: unknown;
  conversationId?: unknown;
  message?: unknown;
};

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function buildEmployeeInstructions(employee: {
  role: string;
  language: string;
  tone: string | null;
  identity: string | null;
  goals: string | null;
  rules: string | null;
  responseStyle: string | null;
  restrictions: string | null;
}) {
  const sections = [
    `Role:\n${employee.role}`,
    `Language:\n${employee.language}`,
    employee.tone ? `Tone:\n${employee.tone}` : null,
    employee.identity
      ? `Identity:\n${employee.identity}`
      : null,
    employee.goals ? `Goals:\n${employee.goals}` : null,
    employee.rules ? `Rules:\n${employee.rules}` : null,
    employee.responseStyle
      ? `Response style:\n${employee.responseStyle}`
      : null,
    employee.restrictions
      ? `Restrictions:\n${employee.restrictions}`
      : null,
  ];

  return sections
    .filter((section): section is string => section !== null)
    .join("\n\n");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function POST(request: Request) {
  let body: WidgetChatBody;

  try {
    body = (await request.json()) as WidgetChatBody;
  } catch {
    return jsonResponse(
      {
        success: false,
        error: "Request body must contain valid JSON.",
      },
      400,
    );
  }

  const widgetKey =
    typeof body.widgetKey === "string"
      ? body.widgetKey.trim()
      : "";

  const conversationId =
    typeof body.conversationId === "string"
      ? body.conversationId.trim()
      : "";

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!widgetKey) {
    return jsonResponse(
      {
        success: false,
        error: "Widget key is required.",
      },
      400,
    );
  }

  if (!message) {
    return jsonResponse(
      {
        success: false,
        error: "Message is required.",
      },
      400,
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(
      {
        success: false,
        error: `Message must contain at most ${MAX_MESSAGE_LENGTH} characters.`,
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
            name: true,
            role: true,
            language: true,
            tone: true,
            identity: true,
            goals: true,
            rules: true,
            responseStyle: true,
            restrictions: true,
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

    const employee = channel.employee;

    let activeConversationId = conversationId;
    let conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    if (activeConversationId) {
      const conversation = await getConversationHistory(
        activeConversationId,
      );

      if (conversation.employeeId !== employee.id) {
        return jsonResponse(
          {
            success: false,
            error: "Conversation is unavailable.",
          },
          404,
        );
      }

      conversationHistory = conversation.messages
        .slice(-CONVERSATION_HISTORY_LIMIT)
        .map((conversationMessage) => ({
          role:
            conversationMessage.role === "USER"
              ? ("user" as const)
              : ("assistant" as const),
          content: conversationMessage.content,
        }));

      await saveUserMessage({
        conversationId: activeConversationId,
        content: message,
      });
    } else {
      const conversation = await startConversation({
        employeeId: employee.id,
        firstMessage: message,
      });

      activeConversationId = conversation.id;
    }

    const knowledgeResults = await searchKnowledge({
      employeeId: employee.id,
      query: message,
      limit: KNOWLEDGE_RESULT_LIMIT,
    });

    const knowledge = knowledgeResults.map(
      (result, index) =>
        [
          `[Knowledge source ${index + 1}: ${result.sourceTitle}]`,
          result.content,
        ].join("\n"),
    );

    const prompt = buildPrompt({
      employeeName: employee.name,
      instructions: buildEmployeeInstructions(employee),
      knowledge,
      conversation: conversationHistory,
      message,
    });

    const response = await generateResponse({
      prompt,
    });

    const normalizedResponse = response.trim();

    if (!normalizedResponse) {
      return jsonResponse(
        {
          success: false,
          error: "The AI Employee returned an empty response.",
          conversationId: activeConversationId,
        },
        502,
      );
    }

    await saveAssistantMessage({
      conversationId: activeConversationId,
      content: normalizedResponse,
    });

    return jsonResponse({
      success: true,
      conversationId: activeConversationId,
      message: normalizedResponse,
    });
  } catch (error) {
    console.error("Widget chat request failed:", error);

    return jsonResponse(
      {
        success: false,
        error: "Unable to generate a response.",
      },
      500,
    );
  }
}
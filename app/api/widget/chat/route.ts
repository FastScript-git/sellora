import { NextResponse } from "next/server";

import { buildPrompt } from "@/features/ai/services/build-prompt";
import { generateResponse } from "@/features/ai/services/generate-response";
import {
  getConversationHistory,
  saveAssistantMessage,
  saveUserMessage,
  startConversation,
} from "@/features/conversations/services/conversation.service";
import { createAnonymousContact } from "@/features/contacts/repositories/contact.repository";
import { updateContactIntelligence } from "@/features/contacts/services/contact-intelligence.service";
import { validateWidgetRequest } from "@/features/channels/services/validate-widget-request";
import { searchKnowledge } from "@/features/knowledge/services/search-knowledge";

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

function getCorsHeaders(request?: Request) {
  const origin = request?.headers.get("origin");

  return {
    "Access-Control-Allow-Origin": origin && origin !== "null" ? origin : "*",

    "Access-Control-Allow-Methods": "POST, OPTIONS",

    "Access-Control-Allow-Headers": "Content-Type",

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
    employee.identity ? `Identity:\n${employee.identity}` : null,
    employee.goals ? `Goals:\n${employee.goals}` : null,
    employee.rules ? `Rules:\n${employee.rules}` : null,
    employee.responseStyle
      ? `Response style:\n${employee.responseStyle}`
      : null,
    employee.restrictions ? `Restrictions:\n${employee.restrictions}` : null,
  ];

  return sections
    .filter((section): section is string => section !== null)
    .join("\n\n");
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
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
      request,
    );
  }

  const widgetKey =
    typeof body.widgetKey === "string" ? body.widgetKey.trim() : "";

  const conversationId =
    typeof body.conversationId === "string" ? body.conversationId.trim() : "";

  const message = typeof body.message === "string" ? body.message.trim() : "";

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

  if (!message) {
    return jsonResponse(
      {
        success: false,
        error: "Message is required.",
      },
      400,
      request,
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(
      {
        success: false,
        error: `Message must contain at most ${MAX_MESSAGE_LENGTH} characters.`,
      },
      400,
      request,
    );
  }

  try {
    const validation = await validateWidgetRequest({
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

    const employee = validation.channel.employee;

    let activeConversationId = conversationId;
    let activeContactId: string | null = null;

    let conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    if (activeConversationId) {
      const conversation = await getConversationHistory(activeConversationId);

      if (conversation.employeeId !== employee.id) {
        return jsonResponse(
          {
            success: false,
            error: "Conversation is unavailable.",
          },
          404,
          request,
        );
      }

      activeContactId = conversation.contactId;

      conversationHistory = conversation.messages
        .slice(-CONVERSATION_HISTORY_LIMIT)
        .map(
          (conversationMessage: {
            role: "USER" | "ASSISTANT";
            content: string;
          }) => ({
            role:
              conversationMessage.role === "USER"
                ? ("user" as const)
                : ("assistant" as const),
            content: conversationMessage.content,
          }),
        );

      await saveUserMessage({
        conversationId: activeConversationId,
        content: message,
      });

      if (conversation.mode === "HUMAN") {
        if (activeContactId) {
          await updateContactIntelligence({
            contactId: activeContactId,
          });
        }

        const handoffMessage =
          employee.language === "UK"
            ? "Ваше повідомлення передано оператору. Він відповість вам найближчим часом."
            : "Your message has been sent to a human operator. They will reply as soon as possible.";

        return jsonResponse(
          {
            success: true,
            conversationId: activeConversationId,
            message: handoffMessage,
            awaitingHuman: true,
          },
          200,
          request,
        );
      }
    } else {
      const contact = await createAnonymousContact({
        workspaceId: employee.workspaceId,
      });

      activeContactId = contact.id;

      const conversation = await startConversation({
        employeeId: employee.id,
        contactId: contact.id,
        firstMessage: message,
      });

      activeConversationId = conversation.id;
    }

    const knowledgeResults = await searchKnowledge({
      employeeId: employee.id,
      query: message,
      limit: KNOWLEDGE_RESULT_LIMIT,
    });

    const knowledge = knowledgeResults.map((result, index) =>
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

    if (activeContactId) {
      await updateContactIntelligence({
        contactId: activeContactId,
      });
    }

    return jsonResponse(
      {
        success: true,
        conversationId: activeConversationId,
        message: normalizedResponse,
      },
      200,
      request,
    );
  } catch (error) {
    console.error("Widget chat request failed:", error);

    return jsonResponse(
      {
        success: false,
        error: "Unable to generate a response.",
      },
      500,
      request,
    );
  }
}

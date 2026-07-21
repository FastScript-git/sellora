"use server";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { buildPrompt } from "@/features/ai/services/build-prompt";
import { generateResponse } from "@/features/ai/services/generate-response";
import {
  getConversationHistory,
  saveAssistantMessage,
  saveUserMessage,
  startConversation,
} from "@/features/conversations/services/conversation.service";
import { searchKnowledge } from "@/features/knowledge/services/search-knowledge";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type SendMessageInput = {
  employeeId: string;
  conversationId?: string | null;
  message: string;
};

type SendMessageResult =
  | {
      success: true;
      message: string;
      conversationId: string;
    }
  | {
      success: false;
      error: string;
      conversationId?: string;
    };

const MAX_MESSAGE_LENGTH = 4000;
const KNOWLEDGE_RESULT_LIMIT = 5;
const CONVERSATION_HISTORY_LIMIT = 20;

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
    employee.restrictions
      ? `Restrictions:\n${employee.restrictions}`
      : null,
  ];

  return sections
    .filter((section): section is string => section !== null)
    .join("\n\n");
}

export async function sendMessageAction({
  employeeId,
  conversationId,
  message,
}: SendMessageInput): Promise<SendMessageResult> {
  const normalizedEmployeeId = employeeId.trim();
  const normalizedConversationId = conversationId?.trim() || null;
  const normalizedMessage = message.trim();

  if (!normalizedEmployeeId) {
    return {
      success: false,
      error: "AI Employee ID is required.",
    };
  }

  if (!normalizedMessage) {
    return {
      success: false,
      error: "Enter a message before sending.",
    };
  }

  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must contain at most ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  let activeConversationId = normalizedConversationId ?? undefined;

  try {
    const workspace = await getCurrentWorkspace();

    const employee = await getAIEmployee({
      employeeId: normalizedEmployeeId,
      workspaceId: workspace.id,
    });

    if (!employee) {
      return {
        success: false,
        error: "AI Employee was not found in this workspace.",
      };
    }

    let conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    if (normalizedConversationId) {
      const conversation = await getConversationHistory(
        normalizedConversationId,
      );

      if (conversation.employeeId !== employee.id) {
        return {
          success: false,
          error: "Conversation does not belong to this AI Employee.",
        };
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
        conversationId: conversation.id,
        content: normalizedMessage,
      });
    } else {
      const conversation = await startConversation({
        employeeId: employee.id,
        firstMessage: normalizedMessage,
      });

      activeConversationId = conversation.id;
    }

    const instructions = buildEmployeeInstructions(employee);

    const knowledgeResults = await searchKnowledge({
      employeeId: employee.id,
      query: normalizedMessage,
      limit: KNOWLEDGE_RESULT_LIMIT,
    });

    const citations = knowledgeResults.map((result, index) => ({
      citationNumber: index + 1,
      sourceId: result.knowledgeSourceId,
      sourceTitle: result.sourceTitle,
      chunkId: result.id,
      chunkIndex: result.chunkIndex,
      similarity: result.similarity,
    }));

    const knowledge = knowledgeResults.map((result, index) =>
      [
        `[Knowledge source ${index + 1}: ${result.sourceTitle}]`,
        result.content,
      ].join("\n"),
    );

    const prompt = buildPrompt({
      employeeName: employee.name,
      instructions,
      knowledge,
      conversation: conversationHistory,
      message: normalizedMessage,
    });

    const response = await generateResponse({
      prompt,
    });

    const normalizedResponse = response.trim();

    if (!normalizedResponse) {
      return {
        success: false,
        error: "The AI Employee returned an empty response.",
        conversationId: activeConversationId,
      };
    }

    if (!activeConversationId) {
      throw new Error("Conversation ID was not created.");
    }

    await saveAssistantMessage({
      conversationId: activeConversationId,
      content: normalizedResponse,
      metadata:
        citations.length > 0
          ? {
              citations,
            }
          : undefined,
    });

    return {
      success: true,
      message: normalizedResponse,
      conversationId: activeConversationId,
    };
  } catch (error) {
    console.error("Failed to generate Test Chat response:", error);

    return {
      success: false,
      error:
        "Unable to generate a response. Check the AI and Knowledge configuration and try again.",
      conversationId: activeConversationId,
    };
  }
}
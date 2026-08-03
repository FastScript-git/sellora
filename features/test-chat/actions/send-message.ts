"use server";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { buildPrompt } from "@/features/ai/services/build-prompt";
import { generateResponseDetailed } from "@/features/ai/services/generate-response";
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

type AITraceStep = {
  id: string;
  title: string;
  status: "success" | "warning" | "error";
  durationMs?: number;
  details?: string;
};

type SendMessageResult =
  | {
      success: true;
      message: string;
      conversationId: string;
      citations: Array<{
        sourceId: string;
        sourceTitle: string;
        citationNumbers: number[];
      }>;
      debug: {
        model: string;
        latencyMs: number;
        usage: {
          inputTokens: number;
          outputTokens: number;
          totalTokens: number;
        };
        knowledgeSources: number;
        prompt: string;
        trace: AITraceStep[];
      };
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

  let activeConversationId =
    normalizedConversationId ?? undefined;

  const trace: AITraceStep[] = [];

  try {
    const employeeLoadStartedAt = performance.now();

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

    trace.push({
      id: "employee",
      title: "AI Employee loaded",
      status: "success",
      durationMs: Math.round(
        performance.now() -
          employeeLoadStartedAt,
      ),
      details: employee.name,
    });

    let conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    const historyStartedAt = performance.now();

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

    trace.push({
      id: "conversation",
      title: "Conversation context prepared",
      status: "success",
      durationMs: Math.round(
        performance.now() - historyStartedAt,
      ),
      details:
        conversationHistory.length > 0
          ? `${conversationHistory.length} messages loaded`
          : "New conversation created",
    });

    const personaStartedAt = performance.now();

    const instructions =
      buildEmployeeInstructions(employee);

    trace.push({
      id: "persona",
      title: "Persona loaded",
      status: instructions.trim()
        ? "success"
        : "warning",
      durationMs: Math.round(
        performance.now() - personaStartedAt,
      ),
      details: instructions.trim()
        ? "Employee instructions added"
        : "No Persona instructions configured",
    });

    const knowledgeStartedAt = performance.now();

    const knowledgeResults =
      await searchKnowledge({
        employeeId: employee.id,
        query: normalizedMessage,
        limit: KNOWLEDGE_RESULT_LIMIT,
      });

    trace.push({
      id: "knowledge",
      title: "Knowledge search completed",
      status:
        knowledgeResults.length > 0
          ? "success"
          : "warning",
      durationMs: Math.round(
        performance.now() - knowledgeStartedAt,
      ),
      details:
        knowledgeResults.length > 0
          ? `${knowledgeResults.length} chunks found`
          : "No relevant knowledge found",
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

    const promptStartedAt = performance.now();

    const prompt = buildPrompt({
      employeeName: employee.name,
      instructions,
      knowledge,
      conversation: conversationHistory,
      message: normalizedMessage,
    });

    trace.push({
      id: "prompt",
      title: "Prompt built",
      status: "success",
      durationMs: Math.round(
        performance.now() - promptStartedAt,
      ),
      details: `${prompt.length} characters`,
    });

    const response =
      await generateResponseDetailed({
        prompt,
      });

    const normalizedResponse =
      response.text.trim();

    trace.push({
      id: "model",
      title: "AI response generated",
      status: normalizedResponse
        ? "success"
        : "error",
      durationMs: response.latencyMs,
      details:
        `${response.model} · ` +
        `${response.usage.totalTokens} tokens`,
    });

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

    const saveStartedAt = performance.now();

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

    trace.push({
      id: "save",
      title: "Response saved",
      status: "success",
      durationMs: Math.round(
        performance.now() - saveStartedAt,
      ),
      details: "Conversation updated",
    });

    const groupedCitations = citations.reduce<
      Array<{
        sourceId: string;
        sourceTitle: string;
        citationNumbers: number[];
      }>
    >((groups, citation) => {
      const existingGroup = groups.find(
        (group) => group.sourceId === citation.sourceId,
      );

      if (existingGroup) {
        existingGroup.citationNumbers.push(
          citation.citationNumber,
        );

        return groups;
      }

      groups.push({
        sourceId: citation.sourceId,
        sourceTitle: citation.sourceTitle,
        citationNumbers: [citation.citationNumber],
      });

      return groups;
    }, []);

    return {
      success: true,
      message: normalizedResponse,
      conversationId: activeConversationId,
      citations: groupedCitations,
      debug: {
        model: response.model,
        latencyMs: response.latencyMs,
        usage: response.usage,
        knowledgeSources:
          knowledgeResults.length,
        prompt,
        trace,
      },
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
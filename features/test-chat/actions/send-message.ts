"use server";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { buildLanguageInstructions } from "@/features/ai/services/build-language-instructions";
import { buildPrompt } from "@/features/ai/services/build-prompt";
import { generateResponseDetailed } from "@/features/ai/services/generate-response";
import { generateResponseWithTools } from "@/features/ai/services/generate-response-with-tools";
import {
  getConversationHistory,
  saveAssistantMessage,
  saveUserMessage,
  startConversation,
} from "@/features/conversations/services/conversation.service";
import { searchKnowledge } from "@/features/knowledge/services/search-knowledge";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

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

export type ChatToolResult = {
  id: string;
  type:
    | "google-calendar"
    | "google-docs"
    | "gmail"
    | "generic";
  title: string;
  description: string;
  url: string | null;
  success: boolean;
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
      toolResults: ChatToolResult[];
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

function escapeRegExp(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function removeToolResultUrls({
  content,
  toolExecutions,
}: {
  content: string;
  toolExecutions: Array<
    Record<string, unknown>
  >;
}) {
  const resultUrls = toolExecutions
    .flatMap((execution) => [
      execution["eventUrl"],
      execution["documentUrl"],
    ])
    .filter(
      (url): url is string =>
        typeof url === "string" &&
        url.trim().length > 0,
    );

  let cleanedContent = content;

  for (const url of resultUrls) {
    cleanedContent =
      cleanedContent.replace(
        new RegExp(
          escapeRegExp(url),
          "g",
        ),
        "",
      );
  }

  return cleanedContent
    .replace(
      /(?:ось|here(?:'s| is))?\s*(?:посилання|link)\s*(?:на|to)?\s*(?:документ|подію|document|event)?\s*:\s*(?=\n|$)/gim,
      "",
    )
    .replace(
      /\n[ \t]+\n/g,
      "\n\n",
    )
    .replace(
      /\n{3,}/g,
      "\n\n",
    )
    .trim();
}

function buildEmployeeInstructions(employee: {
  role: string;
  language: "EN" | "UK";
  tone: string | null;
  identity: string | null;
  goals: string | null;
  rules: string | null;
  responseStyle: string | null;
  restrictions: string | null;
}) {
  const sections = [
    `Role:\n${employee.role}`,
    buildLanguageInstructions({
      language: employee.language,
    }),
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

    const knowledgeTool =
      await prisma.aIEmployeeTool.findUnique({
        where: {
          employeeId_key: {
            employeeId: employee.id,
            key: "KNOWLEDGE_SEARCH",
          },
        },
        select: {
          isEnabled: true,
        },
      });

    const knowledgeEnabled =
      knowledgeTool?.isEnabled ?? false;

    const knowledgeResults =
      knowledgeEnabled
        ? await searchKnowledge({
            employeeId: employee.id,
            query: normalizedMessage,
            limit: KNOWLEDGE_RESULT_LIMIT,
          })
        : [];

    trace.push({
      id: "knowledge",
      title: "Knowledge search completed",
      status:
        !knowledgeEnabled
          ? "warning"
          : knowledgeResults.length > 0
            ? "success"
            : "warning",
      durationMs: Math.round(
        performance.now() - knowledgeStartedAt,
      ),
      details:
        !knowledgeEnabled
          ? "Knowledge search tool is disabled"
          : knowledgeResults.length > 0
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

    const enabledTools =
      await prisma.aIEmployeeTool.findMany({
        where: {
          employeeId: employee.id,
          isEnabled: true,
        },
        select: {
          key: true,
        },
      });

    const enabledToolKeys =
      enabledTools.map(
        (tool) => tool.key,
      );

    trace.push({
      id: "tools",
      title: "AI tools prepared",
      status:
        enabledToolKeys.length > 0
          ? "success"
          : "warning",
      details:
        enabledToolKeys.length > 0
          ? `${enabledToolKeys.length} tool(s) enabled: ${enabledToolKeys.join(", ")}`
          : "No executable tools enabled",
    });

    const response =
      enabledToolKeys.length > 0
        ? await generateResponseWithTools({
            prompt,
            enabledToolKeys,
          })
        : {
            ...(await generateResponseDetailed({
              prompt,
            })),
            toolExecutions: [],
          };

    for (
      const execution of
      response.toolExecutions
    ) {
      trace.push({
        id:
          `tool-${execution.name}-` +
          `${trace.length}`,
        title:
          execution.success
            ? "Calendar event created"
            : "Calendar tool failed",
        status:
          execution.success
            ? "success"
            : "error",
        details: execution.details,
      });
    }

    const normalizedResponse =
      removeToolResultUrls({
        content: response.text,
        toolExecutions:
          response.toolExecutions,
      });

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

    const toolResults: ChatToolResult[] =
      response.toolExecutions.map(
        (execution, index) => {
          if (
            execution.name ===
            "create_google_calendar_event"
          ) {
            return {
              id: `${execution.name}-${index}`,
              type:
                "google-calendar" as const,
              title:
                execution.title ??
                "Google Calendar",
              description:
                execution.success
                  ? "Calendar event created successfully."
                  : execution.details,
              url:
                "eventUrl" in execution
                  ? execution.eventUrl
                  : null,
              success:
                execution.success,
            };
          }

          if (
            execution.name ===
            "create_google_document"
          ) {
            return {
              id: `${execution.name}-${index}`,
              type:
                "google-docs" as const,
              title:
                execution.title ??
                "Google Docs",
              description:
                execution.success
                  ? "Google Docs document created successfully."
                  : execution.details,
              url:
                "documentUrl" in execution
                  ? execution.documentUrl
                  : null,
              success:
                execution.success,
            };
          }

          if (
            execution.name ===
            "send_gmail_message"
          ) {
            return {
              id: `${execution.name}-${index}`,
              type: "gmail" as const,
              title:
                execution.title ??
                "Gmail",
              description:
                execution.success
                  ? execution.details
                  : execution.details,
              url:
                execution.success
                  ? "https://mail.google.com/mail/u/0/#sent"
                  : null,
              success:
                execution.success,
            };
          }

          return {
            id: `${execution.name}-${index}`,
            type: "generic" as const,
            title:
              execution.title ??
              "AI Tool",
            description:
              execution.details,
            url: null,
            success:
              execution.success,
          };
        },
      );

    return {
      success: true,
      message: normalizedResponse,
      conversationId: activeConversationId,
      citations: groupedCitations,
      toolResults,
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
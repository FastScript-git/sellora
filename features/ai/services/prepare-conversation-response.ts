import { buildLanguageInstructions } from "@/features/ai/services/build-language-instructions";
import { buildPrompt } from "@/features/ai/services/build-prompt";
import { searchKnowledge } from "@/features/knowledge/services/search-knowledge";
import { prisma } from "@/lib/prisma";

const CONVERSATION_HISTORY_LIMIT = 12;
const KNOWLEDGE_RESULT_LIMIT = 5;

type PrepareConversationResponseParams = {
  conversationId: string;
  userMessageId: string;
  excludedMessageIds?: string[];
};

type EmployeeInstructionsInput = {
  identity: string | null;
  goals: string | null;
  rules: string | null;
  instructions: string | null;
  responseStyle: string | null;
  restrictions: string | null;
  language: "EN" | "UK";
  tone: string | null;
};

export type ConversationKnowledgeSource = {
  knowledgeSourceId: string;
  sourceTitle: string;
  chunkId: string;
  similarity: number;
};

export type PreparedConversationResponse = {
  conversationId: string;
  userMessageId: string;
  prompt: string;
  knowledgeSources: ConversationKnowledgeSource[];
};

function joinEmployeeInstructions({
  identity,
  goals,
  rules,
  instructions,
  responseStyle,
  restrictions,
  language,
  tone,
}: EmployeeInstructionsInput) {
  const sections: string[] = [];

  if (identity?.trim()) {
    sections.push(
      `Identity:\n${identity.trim()}`,
    );
  }

  if (goals?.trim()) {
    sections.push(
      `Goals:\n${goals.trim()}`,
    );
  }

  if (rules?.trim()) {
    sections.push(
      `Rules:\n${rules.trim()}`,
    );
  }

  if (instructions?.trim()) {
    sections.push(
      `Additional instructions:\n${instructions.trim()}`,
    );
  }

  if (responseStyle?.trim()) {
    sections.push(
      `Response style:\n${responseStyle.trim()}`,
    );
  }

  if (restrictions?.trim()) {
    sections.push(
      `Restrictions:\n${restrictions.trim()}`,
    );
  }

  sections.push(
    buildLanguageInstructions({
      language,
    }),
  );

  if (tone?.trim()) {
    sections.push(
      `Tone: ${tone.trim()}`,
    );
  }

  return sections.join("\n\n");
}

export async function prepareConversationResponse({
  conversationId,
  userMessageId,
  excludedMessageIds = [],
}: PrepareConversationResponseParams): Promise<PreparedConversationResponse> {
  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      select: {
        id: true,

        employee: {
          select: {
            id: true,
            name: true,
            status: true,
            language: true,
            tone: true,
            identity: true,
            goals: true,
            rules: true,
            instructions: true,
            responseStyle: true,
            restrictions: true,
          },
        },

        messages: {
          take:
            CONVERSATION_HISTORY_LIMIT + 1,

          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            role: true,
            content: true,
          },
        },
      },
    });

  if (!conversation) {
    throw new Error(
      "AI_CONVERSATION_NOT_FOUND",
    );
  }

  if (
    conversation.employee.status !==
    "ACTIVE"
  ) {
    throw new Error(
      "AI_EMPLOYEE_NOT_ACTIVE",
    );
  }

  const userMessage =
    conversation.messages.find(
      (message) =>
        message.id === userMessageId,
    );

  if (
    !userMessage ||
    userMessage.role !== "USER"
  ) {
    throw new Error(
      "AI_USER_MESSAGE_NOT_FOUND",
    );
  }

  const excludedMessageIdSet =
    new Set([
      userMessageId,
      ...excludedMessageIds,
    ]);

  const conversationHistory =
    conversation.messages
      .filter(
        (message) =>
          !excludedMessageIdSet.has(
            message.id,
          ),
      )
      .slice(
        0,
        CONVERSATION_HISTORY_LIMIT,
      )
      .reverse()
      .map((message) => ({
        role:
          message.role === "USER"
            ? ("user" as const)
            : ("assistant" as const),

        content: message.content,
      }));

  const knowledgeResults =
    await searchKnowledge({
      employeeId:
        conversation.employee.id,
      query: userMessage.content,
      limit: KNOWLEDGE_RESULT_LIMIT,
    });

  const knowledge =
    knowledgeResults.map(
      (result, index) =>
        [
          `[${index + 1}] Source: ${result.sourceTitle}`,
          result.content,
        ].join("\n"),
    );

  const employeeInstructions =
    joinEmployeeInstructions({
      identity:
        conversation.employee.identity,
      goals:
        conversation.employee.goals,
      rules:
        conversation.employee.rules,
      instructions:
        conversation.employee.instructions,
      responseStyle:
        conversation.employee
          .responseStyle,
      restrictions:
        conversation.employee
          .restrictions,
      language:
        conversation.employee.language,
      tone:
        conversation.employee.tone,
    });

  const prompt = buildPrompt({
    employeeName:
      conversation.employee.name,
    instructions:
      employeeInstructions,
    knowledge,
    conversation:
      conversationHistory,
    message:
      userMessage.content,
  });

  return {
    conversationId:
      conversation.id,
    userMessageId:
      userMessage.id,
    prompt,

    knowledgeSources:
      knowledgeResults.map(
        (result) => ({
          knowledgeSourceId:
            result.knowledgeSourceId,
          sourceTitle:
            result.sourceTitle,
          chunkId:
            result.id,
          similarity:
            result.similarity,
        }),
      ),
  };
}

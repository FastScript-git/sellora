import { generateConversationResponse } from "@/features/ai/services/generate-conversation-response";
import {
  processConversationPostResponseSideEffects,
  processConversationPreResponseSideEffects,
} from "@/features/ai/services/process-conversation-side-effects";

type ProcessWidgetMessageInput = {
  workspaceId: string;
  contactId: string;
  conversationId: string;
  userMessageId: string;
  content: string;
};

export type ProcessWidgetMessageResult = {
  assistantMessage: Awaited<
    ReturnType<
      typeof generateConversationResponse
    >
  > | null;

  warning: string | null;
};

export async function processWidgetMessage({
  workspaceId,
  contactId,
  conversationId,
  userMessageId,
  content,
}: ProcessWidgetMessageInput): Promise<ProcessWidgetMessageResult> {
  await processConversationPreResponseSideEffects({
    workspaceId,
    contactId,
    content,
  });

  let assistantMessage: Awaited<
    ReturnType<
      typeof generateConversationResponse
    >
  > | null = null;

  let warning: string | null = null;

  try {
    assistantMessage =
      await generateConversationResponse({
        conversationId,
        userMessageId,
      });
  } catch (error) {
    console.error(
      "Failed to generate AI response:",
      error,
    );

    warning =
      "The AI employee could not generate a response.";
  }

  await processConversationPostResponseSideEffects({
    workspaceId,
    contactId,
    conversationId,
  });

  return {
    assistantMessage,
    warning,
  };
}

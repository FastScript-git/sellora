import { ConversationRole } from "@/lib/generated/prisma/client";

import {
  createConversation,
  createConversationMessage,
  getConversationWithMessages,
} from "@/features/conversations/repositories/conversation.repository";

type StartConversationParams = {
  employeeId: string;
  contactId?: string | null;
  firstMessage: string;
};

export async function startConversation({
  employeeId,
  contactId,
  firstMessage,
}: StartConversationParams) {
  const title =
    firstMessage.length > 80
      ? `${firstMessage.slice(0, 77)}...`
      : firstMessage;

  const conversation = await createConversation({
    employeeId,
    contactId,
    title,
  });

  await createConversationMessage({
    conversationId: conversation.id,
    role: ConversationRole.USER,
    content: firstMessage,
  });

  return conversation;
}

type SaveAssistantMessageParams = {
  conversationId: string;
  content: string;
};

export async function saveAssistantMessage({
  conversationId,
  content,
}: SaveAssistantMessageParams) {
  return createConversationMessage({
    conversationId,
    role: ConversationRole.ASSISTANT,
    content,
  });
}

type SaveUserMessageParams = {
  conversationId: string;
  content: string;
};

export async function saveUserMessage({
  conversationId,
  content,
}: SaveUserMessageParams) {
  return createConversationMessage({
    conversationId,
    role: ConversationRole.USER,
    content,
  });
}

export async function getConversationHistory(
  conversationId: string,
) {
  const conversation =
    await getConversationWithMessages(conversationId);

  if (!conversation) {
    throw new Error("Conversation was not found.");
  }

  return conversation;
}
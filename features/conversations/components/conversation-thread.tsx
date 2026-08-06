"use client";

import {
  Bot,
  Loader2,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConversationAIReplyButton } from "@/features/conversations/components/conversation-ai-reply-button";
import type { AIStreamEvent } from "@/features/ai/streaming/stream-events";
import { ConversationMessage } from "@/features/conversations/components/conversation-message";
import type {
  ConversationRole,
  Prisma,
} from "@/lib/generated/prisma/client";

type ConversationThreadMessage = {
  id: string;
  role: ConversationRole;
  content: string;
  metadata: Prisma.JsonValue | null;
  createdAt: Date | string;
  status?:
    | "sending"
    | "sent"
    | "failed";
};

type CreateMessageResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
  message?: {
    id: string;
    conversationId: string;
    role: ConversationRole;
    content: string;
    metadata: Prisma.JsonValue | null;
    createdAt: string;
  };
};

type ConversationThreadProps = {
  conversationId: string;
  initialMessages: ConversationThreadMessage[];
  locale: string;
  showComposer?: boolean;
  showAIReply?: boolean;
  aiReplyDisabled?: boolean;
};

const MAX_CONTENT_LENGTH = 10000;
const MAX_TEXTAREA_HEIGHT = 240;

function getErrorMessage(
  data: CreateMessageResponse,
  fallback: string,
): string {
  if (data.error) {
    return data.error;
  }

  const fieldError = data.fieldErrors
    ? Object.values(data.fieldErrors)
        .flat()
        .find(
          (
            message,
          ): message is string =>
            typeof message ===
            "string",
        )
    : undefined;

  return fieldError ?? fallback;
}

export function ConversationThread({
  conversationId,
  initialMessages,
  locale,
  showComposer = false,
  showAIReply = false,
  aiReplyDisabled = false,
}: ConversationThreadProps) {
  const t = useTranslations(
    "aiEmployeeConversationComposer",
  );

  const aiT = useTranslations(
    "aiEmployeeConversationAiReply",
  );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );

  const endRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [messages, setMessages] =
    useState<ConversationThreadMessage[]>(
      initialMessages,
    );

  const [content, setContent] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [isGeneratingAI, setIsGeneratingAI] =
    useState(false);

  const [
    streamingMessageId,
    setStreamingMessageId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const trimmedContent =
    content.trim();

  function scrollToBottom(
    behavior: ScrollBehavior = "smooth",
  ) {
    window.requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    });
  }

  function resizeTextarea(
    textarea: HTMLTextAreaElement,
  ) {
    textarea.style.height = "auto";

    const nextHeight = Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT,
    );

    textarea.style.height =
      `${nextHeight}px`;

    textarea.style.overflowY =
      textarea.scrollHeight >
      MAX_TEXTAREA_HEIGHT
        ? "auto"
        : "hidden";
  }

  function resetTextarea() {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.overflowY =
      "hidden";
  }

  function handleAIStreamEvent(
    event: AIStreamEvent,
  ) {
    if (
      event.type ===
      "assistant_message_started"
    ) {
      setStreamingMessageId(
        event.messageId,
      );

      setMessages((current) => [
        ...current,
        {
          id: event.messageId,
          role: "ASSISTANT",
          content: "",
          metadata: {
            source:
              "OPENAI_STREAM",
          },
          createdAt:
            event.createdAt,
          status: "sending",
        },
      ]);

      scrollToBottom();
      return;
    }

    if (event.type === "delta") {
      setMessages((current) =>
        current.map((message) =>
          message.id ===
          event.messageId
            ? {
                ...message,
                content:
                  message.content +
                  event.delta,
              }
            : message,
        ),
      );

      scrollToBottom();
      return;
    }

    if (
      event.type ===
      "assistant_message"
    ) {
      setMessages((current) =>
        current.map((message) =>
          message.id ===
          streamingMessageId
            ? {
                id:
                  event.message.id,
                role:
                  "ASSISTANT",
                content:
                  event.message.content,
                metadata: {
                  source:
                    "OPENAI",
                  citations:
                    event.citations,
                },
                createdAt:
                  event.message
                    .createdAt,
                status:
                  "sent",
              }
            : message,
        ),
      );

      scrollToBottom();
      return;
    }

    if (event.type === "error") {
      setMessages((current) =>
        current.map((message) =>
          message.id ===
          streamingMessageId
            ? {
                ...message,
                status: "failed",
              }
            : message,
        ),
      );

      setError(event.error);
    }
  }

  async function sendMessage(): Promise<void> {
    if (
      !trimmedContent ||
      isSending
    ) {
      return;
    }

    const submittedContent =
      trimmedContent;

    const optimisticId =
      `optimistic-${crypto.randomUUID()}`;

    const optimisticMessage: ConversationThreadMessage =
      {
        id: optimisticId,
        role: "OPERATOR",
        content: submittedContent,
        metadata: {
          source: "DASHBOARD",
        },
        createdAt: new Date(),
        status: "sending",
      };

    setMessages((current) => [
      ...current,
      optimisticMessage,
    ]);

    setContent("");
    setError(null);
    setIsSending(true);

    window.requestAnimationFrame(() => {
      resetTextarea();
      scrollToBottom();
    });

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content:
              submittedContent,
          }),
        },
      );

      const data =
        (await response.json()) as CreateMessageResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.message
      ) {
        throw new Error(
          getErrorMessage(
            data,
            t("fallbackError"),
          ),
        );
      }

      const createdMessage =
        data.message;

      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId
            ? {
                id: createdMessage.id,
                role: createdMessage.role,
                content:
                  createdMessage.content,
                metadata:
                  createdMessage.metadata,
                createdAt:
                  createdMessage.createdAt,
                status: "sent",
              }
            : message,
        ),
      );

      scrollToBottom();
    } catch (caughtError) {
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId
            ? {
                ...message,
                status: "failed",
              }
            : message,
        ),
      );

      setContent(submittedContent);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("fallbackError"),
      );

      window.requestAnimationFrame(() => {
        const textarea =
          textareaRef.current;

        if (textarea) {
          resizeTextarea(textarea);
          textarea.focus();
        }
      });
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-w-0 flex-1 space-y-5 overflow-y-auto px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className="min-w-0"
          >
            <ConversationMessage
              role={message.role}
              content={message.content}
              createdAt={
                message.createdAt instanceof
                Date
                  ? message.createdAt
                  : new Date(
                      message.createdAt,
                    )
              }
              metadata={
                message.metadata
              }
              locale={locale}
            />

            {message.status ===
            "sending" ? (
              <p className="mt-1 text-right text-[11px] text-muted-foreground">
                {t("sending")}
              </p>
            ) : null}

            {message.status ===
            "failed" ? (
              <p className="mt-1 text-right text-[11px] text-destructive">
                {t("failed")}
              </p>
            ) : null}
          </div>
        ))}

        {isGeneratingAI &&
        !streamingMessageId ? (
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <Bot className="size-4 text-muted-foreground" />
            </span>

            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border bg-card px-4 py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />

              <span className="text-sm text-muted-foreground">
                {aiT("thinking")}
              </span>
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {showAIReply ? (
        <div className="shrink-0 border-t bg-background px-3 pt-3 sm:px-4 sm:pt-4">
          <ConversationAIReplyButton
            conversationId={
              conversationId
            }
            disabled={
              aiReplyDisabled ||
              isSending
            }
            onStreamEvent={
              handleAIStreamEvent
            }
            onGeneratingChange={(
              generating,
            ) => {
              setIsGeneratingAI(
                generating,
              );

              if (generating) {
                setError(null);
                setStreamingMessageId(
                  null,
                );
                scrollToBottom();
                return;
              }

              setStreamingMessageId(
                null,
              );
            }}
          />
        </div>
      ) : null}

      {showComposer ? (
        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t bg-background p-3 sm:p-4"
        >
          {error ? (
            <div
              role="alert"
              className="mb-3 break-words rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-5 text-destructive"
            >
              {error}
            </div>
          ) : null}

          <div className="min-w-0 rounded-xl border bg-background p-2 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <Textarea
              ref={textareaRef}
              value={content}
              rows={1}
              maxLength={
                MAX_CONTENT_LENGTH
              }
              disabled={
                isSending ||
                isGeneratingAI
              }
              placeholder={t(
                "placeholder",
              )}
              className="max-h-60 min-h-16 resize-none overflow-y-hidden border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
              onKeyDown={
                handleKeyDown
              }
              onChange={(event) => {
                setContent(
                  event.target.value,
                );

                resizeTextarea(
                  event.target,
                );

                if (error) {
                  setError(null);
                }
              }}
            />

            <div className="flex flex-col gap-2 border-t px-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-words text-xs leading-5 text-muted-foreground">
                {t("hint")}
              </p>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {content.length}/
                  {MAX_CONTENT_LENGTH}
                </span>

                <Button
                  type="submit"
                  size="sm"
                  className="min-w-28 cursor-pointer"
                  disabled={
                    !trimmedContent ||
                    isSending ||
                    isGeneratingAI
                  }
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}

                  {isSending
                    ? t("sending")
                    : t("send")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}

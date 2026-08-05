"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Bot,
  CircleDot,
  Loader2,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  sendMessageAction,
  type ChatToolResult,
} from "@/features/test-chat/actions/send-message";
import { ChatMessage } from "@/features/test-chat/components/chat-message";
import {
  TestChatDebugPanel,
  type TestChatDebugData,
} from "@/features/test-chat/components/test-chat-debug-panel";
import { cn } from "@/lib/utils";

type ChatCitation = {
  sourceId: string;
  sourceTitle: string;
  citationNumbers: number[];
};

type ChatMessageItem = {
  id: string;
  role: "user" | "employee";
  content: string;
  citations?: ChatCitation[];
  toolResults?: ChatToolResult[];
};

type EmployeeStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "ARCHIVED";

type TestChatPanelProps = {
  employeeId: string;
  employeeName: string;
  employeeStatus: EmployeeStatus;
};

export function TestChatPanel({
  employeeId,
  employeeName,
  employeeStatus,
}: TestChatPanelProps) {
  const t = useTranslations(
    "aiEmployeeTestChat",
  );

  const createWelcomeMessage =
    (): ChatMessageItem => ({
      id: crypto.randomUUID(),
      role: "employee",
      content: t("chat.welcome", {
        employeeName,
      }),
    });

  const [message, setMessage] =
    useState("");

  const [
    conversationId,
    setConversationId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [debug, setDebug] =
    useState<TestChatDebugData | null>(
      null,
    );

  const [messages, setMessages] =
    useState<ChatMessageItem[]>([
      {
        id: "welcome",
        role: "employee",
        content: t("chat.welcome", {
          employeeName,
        }),
      },
    ]);

  const [isPending, startTransition] =
    useTransition();

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isPending]);

  function handleNewChat() {
    if (isPending) {
      return;
    }

    setConversationId(null);
    setMessage("");
    setError(null);
    setDebug(null);
    setMessages([
      createWelcomeMessage(),
    ]);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      isPending
    ) {
      return;
    }

    const userMessage: ChatMessageItem = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setError(null);

    startTransition(async () => {
      const result =
        await sendMessageAction({
          employeeId,
          conversationId,
          message: trimmedMessage,
        });

      if (result.conversationId) {
        setConversationId(
          result.conversationId,
        );
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "employee",
          content: result.message,
          citations:
            result.citations,
          toolResults:
            result.toolResults,
        },
      ]);

      setDebug(result.debug);
    });
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const statusTranslationKey =
    employeeStatus.toLowerCase() as
      | "active"
      | "draft"
      | "paused"
      | "archived";

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
      <section className="flex min-h-[680px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
        <header className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">
                {t("chat.title")}
              </h3>

              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5",
                  employeeStatus ===
                    "ACTIVE" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
                  employeeStatus ===
                    "DRAFT" &&
                    "border-amber-500/30 bg-amber-500/10 text-amber-500",
                  employeeStatus ===
                    "PAUSED" &&
                    "border-orange-500/30 bg-orange-500/10 text-orange-500",
                )}
              >
                <CircleDot className="size-3" />

                {t(
                  `statuses.${statusTranslationKey}`,
                )}
              </Badge>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {t("chat.description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" />
              {t("chat.preview")}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              disabled={isPending}
            >
              <Plus className="size-4" />
              {t("chat.newChat")}
            </Button>
          </div>
        </header>

        <div className="h-[420px] min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:h-[460px] sm:px-5 xl:h-auto">
          {messages.map(
            (chatMessage) => (
              <ChatMessage
                key={chatMessage.id}
                role={chatMessage.role}
                content={
                  chatMessage.content
                }
                citations={
                  chatMessage.citations
                }
                toolResults={
                  chatMessage.toolResults
                }
              />
            ),
          )}

          {isPending ? (
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                <Bot className="size-4 text-muted-foreground" />
              </span>

              <div className="rounded-2xl rounded-tl-md border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    {t(
                      "chat.thinking",
                      {
                        employeeName,
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t bg-background/70 p-3 sm:p-4"
        >
          {error ? (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border bg-background p-2 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <Textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value,
                )
              }
              onKeyDown={handleKeyDown}
              placeholder={t(
                "chat.placeholder",
                {
                  employeeName,
                },
              )}
              rows={2}
              maxLength={4000}
              disabled={isPending}
              className="min-h-24 resize-y border-0 bg-transparent shadow-none focus-visible:ring-0"
            />

            <div className="flex flex-col gap-2 border-t px-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-words text-xs leading-5 text-muted-foreground">
                {t("chat.hint")}
              </p>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {message.length}/4000
                </span>

                <Button
                  className="w-full sm:w-auto"
                  type="submit"
                  size="sm"
                  disabled={
                    !message.trim() ||
                    isPending
                  }
                  aria-label={t(
                    "chat.send",
                  )}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}

                  <span className="hidden sm:inline">
                    {t("chat.send")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </section>

      <TestChatDebugPanel
        debug={debug}
        prompt={debug?.prompt ?? null}
      />
    </div>
  );
}

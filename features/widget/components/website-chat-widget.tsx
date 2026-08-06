"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LoaderCircle,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";

type WidgetMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  deliveryStatus?:
    | "sending"
    | "sent"
    | "failed";
};

type WebsiteChatWidgetProps = {
  widgetKey: string;
  title: string;
  greeting: string;
  primaryColor: string;
  employeeName: string;
  embedded?: boolean;
};

type SendMessageResponse = {
  data?: {
    conversationId: string;
    message: WidgetMessage;
    assistantMessage: WidgetMessage | null;
    isNewConversation: boolean;

    channel: {
      id: string;
      name: string;
    };

    employee: {
      id: string;
      name: string;
    };
  };

  error?: string;
  warning?: string | null;
};

type LoadConversationResponse = {
  data?: {
    conversation: {
      id: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };

    employee: {
      id: string;
      name: string;
      status: string;
    };

    channel: {
      id: string;
      name: string;
      widgetTitle: string | null;
      widgetGreeting: string | null;
      widgetPrimaryColor: string | null;
    };

    messages: WidgetMessage[];
  };

  error?: string;
};

function formatMessageTime(
  createdAt: string,
) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function WebsiteChatWidget({
  widgetKey,
  title,
  greeting,
  primaryColor,
  employeeName,
  embedded = false,
}: WebsiteChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<
    WidgetMessage[]
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] =
    useState(true);
  const [error, setError] = useState<string>();

  const conversationIdRef = useRef<
    string | undefined
  >(undefined);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  const storageKey = `sellora-widget-conversation:${widgetKey}`;

  useEffect(() => {
    let isCancelled = false;

    async function loadConversationHistory() {
      const savedConversationId =
        window.localStorage.getItem(storageKey);

      if (!savedConversationId) {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }

        return;
      }

      conversationIdRef.current =
        savedConversationId;

      try {
        const response = await fetch(
          `/api/widget/${widgetKey}/conversations/${savedConversationId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const responseBody =
          (await response.json()) as LoadConversationResponse;

        if (!response.ok || !responseBody.data) {
          if (response.status === 404) {
            window.localStorage.removeItem(
              storageKey,
            );

            conversationIdRef.current = undefined;

            if (!isCancelled) {
              setMessages([]);
            }

            return;
          }

          throw new Error(
            responseBody.error ||
              "The conversation history could not be loaded.",
          );
        }

        if (!isCancelled) {
          setMessages(responseBody.data.messages);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "The conversation history could not be loaded.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }
      }
    }

    void loadConversationHistory();

    return () => {
      isCancelled = true;
    };
  }, [storageKey, widgetKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending, isLoadingHistory]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    const nextHeight = Math.min(
      textarea.scrollHeight,
      128,
    );

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > 128
        ? "auto"
        : "hidden";
  }, [content]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedContent = content.trim();

    if (
      !normalizedContent ||
      isSending ||
      isLoadingHistory
    ) {
      return;
    }

    const optimisticMessageId =
      `optimistic-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    const optimisticMessage: WidgetMessage = {
      id: optimisticMessageId,
      role: "USER",
      content: normalizedContent,
      createdAt: new Date().toISOString(),
      deliveryStatus: "sending",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      optimisticMessage,
    ]);

    setContent("");
    setIsSending(true);
    setError(undefined);

    try {
      const savedConversationId =
        conversationIdRef.current ??
        window.localStorage.getItem(storageKey) ??
        undefined;

      const response = await fetch(
        `/api/widget/${widgetKey}/messages`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            conversationId: savedConversationId,
            content: normalizedContent,
          }),
        },
      );

      const responseBody =
        (await response.json()) as SendMessageResponse;

      if (!response.ok || !responseBody.data) {
        throw new Error(
          responseBody.error ||
            "The message could not be sent.",
        );
      }

      const {
        conversationId,
        message,
        assistantMessage,
      } = responseBody.data;

      conversationIdRef.current = conversationId;

      window.localStorage.setItem(
        storageKey,
        conversationId,
      );

      setMessages((currentMessages) => {
        const nextMessages =
          currentMessages.map(
            (currentMessage) =>
              currentMessage.id ===
              optimisticMessageId
                ? {
                    ...message,
                    deliveryStatus:
                      "sent" as const,
                  }
                : currentMessage,
          );

        const existingMessageIds = new Set(
          nextMessages.map(
            (currentMessage) =>
              currentMessage.id,
          ),
        );

        if (
          assistantMessage &&
          !existingMessageIds.has(
            assistantMessage.id,
          )
        ) {
          nextMessages.push({
            ...assistantMessage,
            deliveryStatus: "sent",
          });
        }

        return nextMessages;
      });

      if (responseBody.warning) {
        setError(responseBody.warning);
      }
    } catch (sendError) {
      setMessages((currentMessages) =>
        currentMessages.map(
          (currentMessage) =>
            currentMessage.id ===
            optimisticMessageId
              ? {
                  ...currentMessage,
                  deliveryStatus: "failed",
                }
              : currentMessage,
        ),
      );

      setError(
        sendError instanceof Error
          ? sendError.message
          : "The message could not be sent.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen && !embedded) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 flex size-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-black/10 sm:bottom-6 sm:right-6"
        style={{
          backgroundColor: primaryColor,
        }}
        aria-label="Open chat"
      >
        <MessageCircle className="size-6" />
      </button>
    );
  }

  return (
    <div
      className={
        embedded
          ? "flex min-h-screen w-full flex-col overflow-hidden bg-white text-zinc-950"
          : "fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-background sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:max-w-[calc(100vw-3rem)] sm:rounded-3xl sm:border sm:shadow-2xl"
      }
    >
      <header
        className="flex items-center justify-between px-4 py-3.5 text-white sm:px-5 sm:py-4"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 sm:size-10">
            <MessageCircle className="size-5" />
          </span>

          <div className="min-w-0">
            <h1 className="truncate font-semibold">
              {title}
            </h1>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              <span>Онлайн</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (embedded) {
              window.parent.postMessage(
                {
                  type: "SELLORA_WIDGET_CLOSE",
                },
                "*",
              );

              return;
            }

            setIsOpen(false);
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          aria-label="Close chat"
        >
          <X className="size-5" />
        </button>
      </header>

      <main
        className={
          embedded
            ? "flex-1 overflow-y-auto bg-zinc-50 px-3 py-4 sm:px-4 sm:py-5"
            : "flex-1 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-4 sm:py-5"
        }
      >
        <div className="flex items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            <MessageCircle className="size-4" />
          </span>

          <div
            className={
              embedded
                ? "max-w-[88%] rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-4 py-3 text-zinc-950 shadow-sm sm:max-w-[82%]"
                : "max-w-[88%] rounded-2xl rounded-tl-md border bg-background px-4 py-3 shadow-sm sm:max-w-[82%]"
            }
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {greeting}
            </p>
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />

            <span>Loading conversation...</span>
          </div>
        ) : null}

        <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "USER";

            return (
              <div
                key={message.id}
                className={
                  isUser
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div className="flex max-w-[90%] items-end gap-2 sm:max-w-[82%]">
                  {!isUser ? (
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
                      style={{
                        backgroundColor:
                          primaryColor,
                      }}
                    >
                      <MessageCircle className="size-3.5" />
                    </span>
                  ) : null}

                  <div
                    className={
                      isUser
                        ? "rounded-2xl rounded-br-md px-4 py-3 text-white shadow-sm"
                        : embedded
                          ? "rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 text-zinc-950 shadow-sm"
                          : "rounded-2xl rounded-bl-md border bg-background px-4 py-3 shadow-sm"
                    }
                    style={
                      isUser
                        ? {
                            backgroundColor:
                              primaryColor,
                          }
                        : undefined
                    }
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>

                    <div
                      className={
                        isUser
                          ? "mt-1.5 flex items-center justify-end gap-2 text-[10px] text-white/70"
                          : "mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground"
                      }
                    >
                      <time
                        dateTime={message.createdAt}
                      >
                        {formatMessageTime(
                          message.createdAt,
                        )}
                      </time>

                      {isUser &&
                      message.deliveryStatus ===
                        "sending" ? (
                        <span>Sending...</span>
                      ) : null}

                      {isUser &&
                      message.deliveryStatus ===
                        "failed" ? (
                        <span className="font-medium text-red-100">
                          Not sent
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {isUser ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
                      <UserRound className="size-3.5 text-muted-foreground" />
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {isSending ? (
            <div className="flex justify-start">
              <div className="flex max-w-[82%] items-end gap-2">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  <MessageCircle className="size-3.5" />
                </span>

                <div
                  className={
                    embedded
                      ? "rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 shadow-sm"
                      : "rounded-2xl rounded-bl-md border bg-background px-4 py-3 shadow-sm"
                  }
                >
                  <div
                    className="flex items-center gap-2"
                    aria-label={`${employeeName} is typing`}
                    role="status"
                  >
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/70" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div ref={messagesEndRef} />
      </main>

      <footer
        className={
          embedded
            ? "border-t border-zinc-200 bg-white p-3 sm:p-4"
            : "border-t bg-background p-3 sm:p-4"
        }
      >
        {error ? (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={10_000}
            disabled={
              isSending || isLoadingHistory
            }
            placeholder={
              isLoadingHistory
                ? "Loading conversation..."
                : "Write a message..."
            }
            className={
              embedded
                ? "max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition-shadow placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-60"
                : "max-h-32 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            }
          />

          <button
            type="submit"
            disabled={
              isSending ||
              isLoadingHistory ||
              content.trim().length === 0
            }
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: primaryColor,
            }}
            aria-label="Send message"
          >
            {isSending ||
            isLoadingHistory ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-muted-foreground sm:mt-3 sm:text-[11px]">
          Powered by Sellora
        </p>
      </footer>
    </div>
  );
}
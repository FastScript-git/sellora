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
};

type WebsiteChatWidgetProps = {
  widgetKey: string;
  title: string;
  greeting: string;
  primaryColor: string;
  employeeName: string;
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

export function WebsiteChatWidget({
  widgetKey,
  title,
  greeting,
  primaryColor,
  employeeName,
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
        const existingMessageIds = new Set(
          currentMessages.map(
            (currentMessage) => currentMessage.id,
          ),
        );

        const nextMessages = [
          ...currentMessages,
        ];

        if (!existingMessageIds.has(message.id)) {
          nextMessages.push(message);
          existingMessageIds.add(message.id);
        }

        if (
          assistantMessage &&
          !existingMessageIds.has(
            assistantMessage.id,
          )
        ) {
          nextMessages.push(assistantMessage);
        }

        return nextMessages;
      });

      setContent("");

      if (responseBody.warning) {
        setError(responseBody.warning);
      }
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The message could not be sent.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-black/10"
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
    <div className="fixed bottom-6 right-6 flex h-[620px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border bg-background shadow-2xl">
      <header
        className="flex items-center justify-between px-5 py-4 text-white"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
            <MessageCircle className="size-5" />
          </span>

          <div className="min-w-0">
            <h1 className="truncate font-semibold">
              {title}
            </h1>

            <p className="mt-0.5 truncate text-xs text-white/80">
              {employeeName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          aria-label="Close chat"
        >
          <X className="size-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto bg-muted/20 px-4 py-5">
        <div className="flex items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            <MessageCircle className="size-4" />
          </span>

          <div className="max-w-[82%] rounded-2xl rounded-tl-md border bg-background px-4 py-3 shadow-sm">
            <p className="text-sm leading-6">
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

        <div className="mt-5 space-y-4">
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
                <div className="flex max-w-[82%] items-end gap-2">
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

                <div className="rounded-2xl rounded-bl-md border bg-background px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" />

                    <span>
                      {employeeName} is typing...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t bg-background p-4">
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
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Powered by Sellora
        </p>
      </footer>
    </div>
  );
}
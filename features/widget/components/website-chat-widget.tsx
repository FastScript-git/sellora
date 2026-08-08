"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bot,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import type { AIStreamEvent } from "@/features/ai/streaming/stream-events";
import {
  WidgetChatMessage,
  type WidgetMessage,
} from "@/features/widget/components/widget-chat-message";

type WebsiteChatWidgetProps = {
  widgetKey: string;
  title: string;
  primaryColor: string;
  employeeName: string;
  locale: string;
  embedded?: boolean;
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
  primaryColor,
  employeeName,
  locale,
  embedded = false,
}: WebsiteChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<
    WidgetMessage[]
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] =
    useState(false);
  const [isLoadingHistory, setIsLoadingHistory] =
    useState(true);
  const [error, setError] = useState<string>();

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        online: "Онлайн",
        responseTime:
          "Зазвичай відповідає миттєво",
        loading:
          "Завантаження розмови...",
        placeholder:
          "Напишіть повідомлення...",
        openChat:
          "Відкрити чат",
        closeChat:
          "Закрити чат",
        sendMessage:
          "Надіслати повідомлення",
        sending:
          "Надсилання...",
        notSent:
          "Не надіслано",
        poweredBy:
          "Працює на Sellora",
        welcomeTitle:
          "Вітаю! Чим можу допомогти?",
        welcomeDescription:
          "Поставте запитання, і я знайду потрібну інформацію.",
        suggestions: [
          "Розкажіть про ваші послуги",
          "Які у вас ціни?",
          "Як зв’язатися з менеджером?",
        ],
      }
    : {
        online: "Online",
        responseTime:
          "Usually replies instantly",
        loading:
          "Loading conversation...",
        placeholder:
          "Write a message...",
        openChat:
          "Open chat",
        closeChat:
          "Close chat",
        sendMessage:
          "Send message",
        sending:
          "Sending...",
        notSent:
          "Not sent",
        poweredBy:
          "Powered by Sellora",
        welcomeTitle:
          "Hi! How can I help?",
        welcomeDescription:
          "Ask a question and I’ll find the information you need.",
        suggestions: [
          "Tell me about your services",
          "What are your prices?",
          "How can I contact sales?",
        ],
      };

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

  async function submitMessage(
    rawContent: string,
  ) {
    const normalizedContent =
      rawContent.trim();

    if (
      !normalizedContent ||
      isSending ||
      isLoadingHistory
    ) {
      return;
    }

    const optimisticMessageId =
      `optimistic-${crypto.randomUUID()}`;

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
    setIsStreamingResponse(false);
    setError(undefined);

    let streamingMessageId:
      | string
      | undefined;

    try {
      const savedConversationId =
        conversationIdRef.current ??
        window.localStorage.getItem(
          storageKey,
        ) ??
        undefined;

      const response = await fetch(
        `/api/widget/${widgetKey}/messages`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/x-ndjson",
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            conversationId:
              savedConversationId,
            content:
              normalizedContent,
          }),
        },
      );

      if (!response.ok) {
        const rawBody =
          await response.text();

        let errorMessage =
          "The message could not be sent.";

        if (rawBody.trim()) {
          try {
            const parsed =
              JSON.parse(
                rawBody,
              ) as {
                error?: string;
              };

            errorMessage =
              parsed.error ??
              errorMessage;
          } catch {
            errorMessage =
              rawBody;
          }
        }

        throw new Error(
          errorMessage,
        );
      }

      if (!response.body) {
        throw new Error(
          "The streaming response is unavailable.",
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";

      function mergeCitations(
        citations: Extract<
          AIStreamEvent,
          {
            type: "assistant_message";
          }
        >["citations"],
      ) {
        const sources =
          new Map<
            string,
            {
              sourceId: string;
              sourceTitle: string;
              citationNumbers: number[];
            }
          >();

        for (const citation of citations) {
          const existing =
            sources.get(
              citation.sourceId,
            );

          if (existing) {
            for (
              const number of
              citation.citationNumbers
            ) {
              if (
                !existing.citationNumbers.includes(
                  number,
                )
              ) {
                existing.citationNumbers.push(
                  number,
                );
              }
            }

            continue;
          }

          sources.set(
            citation.sourceId,
            {
              sourceId:
                citation.sourceId,
              sourceTitle:
                citation.sourceTitle,
              citationNumbers: [
                ...citation.citationNumbers,
              ],
            },
          );
        }

        return Array.from(
          sources.values(),
        );
      }

      function handleStreamEvent(
        event: AIStreamEvent,
      ) {
        switch (event.type) {
          case "conversation": {
            conversationIdRef.current =
              event.conversationId;

            window.localStorage.setItem(
              storageKey,
              event.conversationId,
            );

            break;
          }

          case "user_message": {
            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (currentMessage) =>
                    currentMessage.id ===
                    optimisticMessageId
                      ? {
                          id:
                            event.message.id,
                          role:
                            "USER",
                          content:
                            event.message
                              .content,
                          createdAt:
                            event.message
                              .createdAt,
                          deliveryStatus:
                            "sent" as const,
                        }
                      : currentMessage,
                ),
            );

            break;
          }

          case "assistant_message_started": {
            streamingMessageId =
              event.messageId;

            setIsStreamingResponse(
              true,
            );

            setMessages(
              (currentMessages) => {
                if (
                  currentMessages.some(
                    (currentMessage) =>
                      currentMessage.id ===
                      event.messageId,
                  )
                ) {
                  return currentMessages;
                }

                return [
                  ...currentMessages,
                  {
                    id:
                      event.messageId,
                    role:
                      "ASSISTANT",
                    content: "",
                    createdAt:
                      event.createdAt,
                    deliveryStatus:
                      "sending",
                  },
                ];
              },
            );

            break;
          }

          case "delta": {
            streamingMessageId =
              event.messageId;

            setIsStreamingResponse(
              true,
            );

            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (currentMessage) =>
                    currentMessage.id ===
                    event.messageId
                      ? {
                          ...currentMessage,
                          content:
                            currentMessage.content +
                            event.delta,
                        }
                      : currentMessage,
                ),
            );

            break;
          }

          case "assistant_message": {
            const temporaryId =
              streamingMessageId;

            const citations =
              mergeCitations(
                event.citations,
              );

            setMessages(
              (currentMessages) => {
                const nextMessage: WidgetMessage =
                  {
                    id:
                      event.message.id,
                    role:
                      "ASSISTANT",
                    content:
                      event.message
                        .content,
                    createdAt:
                      event.message
                        .createdAt,
                    citations,
                    deliveryStatus:
                      "sent",
                  };

                if (!temporaryId) {
                  if (
                    currentMessages.some(
                      (
                        currentMessage,
                      ) =>
                        currentMessage.id ===
                        event.message.id,
                    )
                  ) {
                    return currentMessages;
                  }

                  return [
                    ...currentMessages,
                    nextMessage,
                  ];
                }

                return currentMessages.map(
                  (currentMessage) =>
                    currentMessage.id ===
                    temporaryId
                      ? nextMessage
                      : currentMessage,
                );
              },
            );

            streamingMessageId =
              event.message.id;

            setIsStreamingResponse(
              false,
            );

            break;
          }

          case "error": {
            throw new Error(
              event.error,
            );
          }

          case "done": {
            conversationIdRef.current =
              event.conversationId;

            window.localStorage.setItem(
              storageKey,
              event.conversationId,
            );

            setIsStreamingResponse(
              false,
            );

            break;
          }

          case "debug": {
            break;
          }
        }
      }

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          },
        );

        const lines =
          buffer.split("\n");

        buffer =
          lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event =
            JSON.parse(
              line,
            ) as AIStreamEvent;

          handleStreamEvent(
            event,
          );
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        const event =
          JSON.parse(
            buffer,
          ) as AIStreamEvent;

        handleStreamEvent(
          event,
        );
      }
    } catch (sendError) {
      setMessages(
        (currentMessages) =>
          currentMessages
            .map(
              (currentMessage) =>
                currentMessage.id ===
                optimisticMessageId
                  ? {
                      ...currentMessage,
                      deliveryStatus:
                        "failed" as const,
                    }
                  : currentMessage,
            )
            .filter(
              (currentMessage) =>
                !(
                  streamingMessageId &&
                  currentMessage.id ===
                    streamingMessageId &&
                  currentMessage.role ===
                    "ASSISTANT" &&
                  !currentMessage.content
                    .trim()
                ),
            ),
      );

      setError(
        sendError instanceof Error
          ? sendError.message
          : "The message could not be sent.",
      );
    } finally {
      setIsStreamingResponse(false);
      setIsSending(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void submitMessage(content);
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
        aria-label={copy.openChat}
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
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-sm">
            <Bot className="size-5" />

            <span className="absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full border-2 border-white bg-emerald-400" />
          </span>

          <div className="min-w-0">
            <h1 className="truncate font-semibold">
              {title}
            </h1>

            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/80">
              <Zap className="size-3 shrink-0" />

              <span className="truncate">
                {copy.responseTime}
              </span>

              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-white/45"
              />

              <span className="shrink-0">
                {copy.online}
              </span>
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
          aria-label={copy.closeChat}
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
        {isLoadingHistory ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />

            <span>{copy.loading}</span>
          </div>
        ) : null}

        {!isLoadingHistory &&
        messages.length === 0 ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
                style={{
                  backgroundColor:
                    primaryColor,
                }}
              >
                <Sparkles className="size-3.5" />
              </span>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-950">
                  {copy.welcomeTitle}
                </h2>

                <p className="mt-0.5 text-[11px] leading-4.5 text-zinc-500">
                  {copy.welcomeDescription}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {copy.suggestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      void submitMessage(
                        suggestion,
                      );
                    }}
                    disabled={
                      isSending ||
                      isLoadingHistory
                    }
                    className="min-h-8 cursor-pointer rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-left text-[10px] font-medium leading-4 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </section>
        ) : null}

        <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
          {messages.map((message) => (
            <WidgetChatMessage
              key={message.id}
              message={message}
              primaryColor={
                primaryColor
              }
              embedded={embedded}
              locale={locale}
            />
          ))}

          {isSending &&
          !isStreamingResponse ? (
            <div className="flex justify-start">
              <div className="flex max-w-[82%] items-end gap-2">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  <Bot className="size-3.5" />
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
            ? "border-t border-zinc-200 bg-white px-3 pb-2.5 pt-3 sm:px-4 sm:pt-4"
            : "border-t bg-background px-3 pb-2.5 pt-3 sm:px-4 sm:pt-4"
        }
      >
        {error ? (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className={
            embedded
              ? "flex min-w-0 items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5 shadow-sm transition-shadow focus-within:border-zinc-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-200"
              : "flex min-w-0 items-end gap-2 rounded-2xl border bg-muted/20 p-1.5 shadow-sm transition-shadow focus-within:border-ring focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/30"
          }
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
                ? copy.loading
                : copy.placeholder
            }
            className={
              embedded
                ? "max-h-32 min-h-12 min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-5 text-zinc-950 outline-none placeholder:text-zinc-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                : "max-h-32 min-h-12 min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-5 outline-none placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
            }
          />

          <button
            type="submit"
            disabled={
              isSending ||
              isLoadingHistory ||
              content.trim().length === 0
            }
            className="mb-0.5 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none"
            style={{
              backgroundColor: primaryColor,
            }}
            aria-label={copy.sendMessage}
          >
            {isSending ||
            isLoadingHistory ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Send className="size-4.5" />
            )}
          </button>
        </form>

        <div className="mt-1.5 flex justify-center sm:mt-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-muted-foreground">
            <Sparkles className="size-3" />
            {copy.poweredBy}
          </span>
        </div>
      </footer>
    </div>
  );
}
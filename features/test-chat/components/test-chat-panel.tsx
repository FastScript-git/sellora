"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Loader2,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/features/test-chat/actions/send-message";
import { ChatMessage } from "@/features/test-chat/components/chat-message";

type ChatMessageItem = {
  id: string;
  role: "user" | "employee";
  content: string;
};

type TestChatPanelProps = {
  employeeId: string;
  employeeName: string;
};

function createWelcomeMessage(
  employeeName: string,
): ChatMessageItem {
  return {
    id: crypto.randomUUID(),
    role: "employee",
    content: `Hello! I’m ${employeeName}. Send me a message to test how I respond.`,
  };
}

export function TestChatPanel({
  employeeId,
  employeeName,
}: TestChatPanelProps) {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "welcome",
      role: "employee",
      content: `Hello! I’m ${employeeName}. Send me a message to test how I respond.`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    setMessages([
      createWelcomeMessage(employeeName),
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isPending) {
      return;
    }

    const userMessage: ChatMessageItem = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setMessage("");
    setError(null);

    startTransition(async () => {
      const result = await sendMessageAction({
        employeeId,
        conversationId,
        message: trimmedMessage,
      });

      if (result.conversationId) {
        setConversationId(result.conversationId);
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      const employeeMessage: ChatMessageItem = {
        id: crypto.randomUUID(),
        role: "employee",
        content: result.message,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        employeeMessage,
      ]);
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

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">
            Test Chat
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Test this AI Employee before connecting a live channel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            AI preview
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            disabled={isPending}
          >
            <Plus className="size-4" />
            New chat
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {messages.map((chatMessage) => (
          <ChatMessage
            key={chatMessage.id}
            role={chatMessage.role}
            content={chatMessage.content}
          />
        ))}

        {isPending ? (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </span>

            <div className="rounded-2xl rounded-tl-md border bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {employeeName} is thinking…
              </p>
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background/60 p-4"
      >
        {error ? (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="flex items-end gap-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${employeeName}...`}
            rows={2}
            maxLength={4000}
            disabled={isPending}
            className="min-h-20 resize-none"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isPending}
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Enter to send · Shift + Enter for a new line
          </p>

          {message.length > 0 ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {message.length}/4000
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
"use client";

import {
  Loader2,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ConversationComposerProps = {
  conversationId: string;
  locale: string;
};

type CreateMessageResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

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
          (message): message is string =>
            typeof message === "string",
        )
    : undefined;

  return fieldError ?? fallback;
}

export function ConversationComposer({
  conversationId,
  locale,
}: ConversationComposerProps) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUkrainian = locale === "uk";
  const trimmedContent = content.trim();

  const copy = isUkrainian
    ? {
        placeholder: "Напишіть повідомлення...",
        send: "Надіслати",
        sending: "Надсилання...",
        hint: "Enter — надіслати, Shift + Enter — новий рядок",
        fallbackError: "Не вдалося надіслати повідомлення.",
      }
    : {
        placeholder: "Write a message...",
        send: "Send",
        sending: "Sending...",
        hint: "Enter to send, Shift + Enter for a new line",
        fallbackError: "Failed to send message.",
      };

  async function sendMessage(): Promise<void> {
    if (!trimmedContent || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: trimmedContent,
          }),
        },
      );

      const data =
        (await response.json()) as CreateMessageResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, copy.fallbackError),
        );
      }

      setContent("");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : copy.fallbackError,
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void {
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
    <form
      onSubmit={handleSubmit}
      className="border-t bg-background p-4"
    >
      {error ? (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border bg-background p-2 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <Textarea
          value={content}
          rows={3}
          maxLength={10000}
          disabled={isSending}
          placeholder={copy.placeholder}
          className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setContent(event.target.value);

            if (error) {
              setError(null);
            }
          }}
        />

        <div className="flex flex-col gap-2 border-t px-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {copy.hint}
          </p>

          <div className="flex items-center justify-end gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">
              {content.length}/10000
            </span>

            <Button
              type="submit"
              size="sm"
              disabled={!trimmedContent || isSending}
            >
              {isSending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}

              {isSending
                ? copy.sending
                : copy.send}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

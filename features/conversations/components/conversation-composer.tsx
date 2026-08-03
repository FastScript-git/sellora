"use client";

import {
  Loader2,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useRef,
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
  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
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
    ? Object.values(
        data.fieldErrors,
      )
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

export function ConversationComposer({
  conversationId,
}: ConversationComposerProps) {
  const t = useTranslations(
    "aiEmployeeConversationComposer",
  );

  const router = useRouter();

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );

  const [content, setContent] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const trimmedContent =
    content.trim();

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

  function resetTextareaHeight() {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.overflowY =
      "hidden";
  }

  async function sendMessage(): Promise<void> {
    if (
      !trimmedContent ||
      isSending
    ) {
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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content:
              trimmedContent,
          }),
        },
      );

      const data =
        (await response.json()) as CreateMessageResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          getErrorMessage(
            data,
            t("fallbackError"),
          ),
        );
      }

      setContent("");

      window.requestAnimationFrame(
        resetTextareaHeight,
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("fallbackError"),
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
      !event.nativeEvent
        .isComposing
    ) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-background p-3 sm:p-4"
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
          disabled={isSending}
          placeholder={t(
            "placeholder",
          )}
          className="max-h-60 min-h-16 resize-none overflow-y-hidden border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const nextValue =
              event.target.value;

            setContent(nextValue);
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
                isSending
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
  );
}

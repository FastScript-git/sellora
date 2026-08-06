"use client";

import {
  Bot,
  Sparkles,
  Square,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import type { AIStreamEvent } from "@/features/ai/streaming/stream-events";

type ConversationAIReplyButtonProps = {
  conversationId: string;
  disabled?: boolean;
  onStreamEvent: (
    event: AIStreamEvent,
  ) => void;
  onGeneratingChange?: (
    isGenerating: boolean,
  ) => void;
  onStopped?: () => void;
};

export async function readConversationAIStream({
  url,
  fallbackError,
  onStreamEvent,
  signal,
}: {
  url: string;
  fallbackError: string;
  onStreamEvent: (
    event: AIStreamEvent,
  ) => void;
  signal?: AbortSignal;
}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept:
        "application/x-ndjson",
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      stream: true,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(
      await getResponseError(
        response,
        fallbackError,
      ),
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

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

      onStreamEvent(event);

      if (event.type === "error") {
        throw new Error(
          event.error,
        );
      }
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    const event =
      JSON.parse(
        buffer,
      ) as AIStreamEvent;

    onStreamEvent(event);

    if (event.type === "error") {
      throw new Error(
        event.error,
      );
    }
  }
}

async function getResponseError(
  response: Response,
  fallback: string,
) {
  const rawBody =
    await response.text();

  if (!rawBody.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(
      rawBody,
    ) as {
      error?: string;
    };

    return parsed.error ?? fallback;
  } catch {
    return rawBody;
  }
}

export function ConversationAIReplyButton({
  conversationId,
  disabled = false,
  onStreamEvent,
  onGeneratingChange,
  onStopped,
}: ConversationAIReplyButtonProps) {
  const t = useTranslations(
    "aiEmployeeConversationAiReply",
  );

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(
      null,
    );

  function stopGenerating() {
    abortControllerRef.current?.abort();
  }

  async function generateReply(): Promise<void> {
    if (isGenerating || disabled) {
      return;
    }

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

    setIsGenerating(true);
    setError(null);
    onGeneratingChange?.(true);

    try {
      await readConversationAIStream({
        url:
          `/api/conversations/${conversationId}/ai-reply`,
        fallbackError:
          t("fallbackError"),
        onStreamEvent,
        signal:
          abortController.signal,
      });
    } catch (caughtError) {
      const wasAborted =
        abortController.signal.aborted ||
        (caughtError instanceof Error &&
          caughtError.name ===
            "AbortError");

      if (wasAborted) {
        onStopped?.();
      } else {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : t("fallbackError"),
        );
      }
    } finally {
      if (
        abortControllerRef.current ===
        abortController
      ) {
        abortControllerRef.current =
          null;
      }

      setIsGenerating(false);
      onGeneratingChange?.(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? (
        <div
          role="alert"
          className="break-words rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-5 text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer"
        disabled={
          disabled && !isGenerating
        }
        onClick={() => {
          if (isGenerating) {
            stopGenerating();
            return;
          }

          void generateReply();
        }}
      >
        {isGenerating ? (
          <Square className="size-4 fill-current" />
        ) : (
          <Sparkles className="size-4" />
        )}

        {isGenerating
          ? t("stop")
          : t("generate")}

        {!isGenerating ? (
          <Bot className="ml-auto size-4" />
        ) : null}
      </Button>
    </div>
  );
}

"use client";

import {
  Bot,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
};

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
}: ConversationAIReplyButtonProps) {
  const t = useTranslations(
    "aiEmployeeConversationAiReply",
  );

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function generateReply(): Promise<void> {
    if (isGenerating || disabled) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    onGeneratingChange?.(true);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/ai-reply`,
        {
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
        },
      );

      if (
        !response.ok ||
        !response.body
      ) {
        throw new Error(
          await getResponseError(
            response,
            t("fallbackError"),
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

          onStreamEvent(event);

          if (
            event.type === "error"
          ) {
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
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("fallbackError"),
      );
    } finally {
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
          disabled ||
          isGenerating
        }
        onClick={generateReply}
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}

        {isGenerating
          ? t("generating")
          : t("generate")}

        {!isGenerating ? (
          <Bot className="ml-auto size-4" />
        ) : null}
      </Button>
    </div>
  );
}

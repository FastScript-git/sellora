"use client";

import {
  Bot,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  ConversationRole,
  Prisma,
} from "@/lib/generated/prisma/client";

export type GeneratedConversationMessage = {
  id: string;
  conversationId: string;
  role: ConversationRole;
  content: string;
  metadata: Prisma.JsonValue | null;
  createdAt: string;
};

type ConversationAIReplyButtonProps = {
  conversationId: string;
  disabled?: boolean;
  onGenerated: (
    message: GeneratedConversationMessage,
  ) => void;
  onGeneratingChange?: (
    isGenerating: boolean,
  ) => void;
};

type AIReplyResponse = {
  success: boolean;
  error?: string;
  warning?: string | null;
  message?: GeneratedConversationMessage;
};

export function ConversationAIReplyButton({
  conversationId,
  disabled = false,
  onGenerated,
  onGeneratingChange,
}: ConversationAIReplyButtonProps) {
  const t = useTranslations(
    "aiEmployeeConversationAiReply",
  );

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [warning, setWarning] =
    useState<string | null>(null);

  async function generateReply(): Promise<void> {
    if (isGenerating || disabled) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setWarning(null);
    onGeneratingChange?.(true);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/ai-reply`,
        {
          method: "POST",
        },
      );

      const data =
        (await response.json()) as AIReplyResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.message
      ) {
        throw new Error(
          data.error ??
            t("fallbackError"),
        );
      }

      onGenerated(data.message);

      if (data.warning) {
        setWarning(data.warning);
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

      {warning ? (
        <div
          role="status"
          className="break-words rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm leading-5 text-amber-500"
        >
          {warning}
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

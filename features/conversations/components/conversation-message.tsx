"use client";

import {
  BookOpen,
  Bot,
  Check,
  Copy,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type {
  ConversationRole,
  Prisma,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type KnowledgeSource = {
  knowledgeSourceId: string;
  sourceTitle: string;
  chunkId: string;
  similarity?: number;
};

type ConversationMessageProps = {
  role: ConversationRole;
  content: string;
  createdAt: Date;
  metadata?: Prisma.JsonValue | null;
  locale: string;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function parseKnowledgeSources(
  metadata: Prisma.JsonValue | null | undefined,
): KnowledgeSource[] {
  if (!isRecord(metadata)) {
    return [];
  }

  const rawSources =
    metadata.knowledgeSources;

  if (!Array.isArray(rawSources)) {
    return [];
  }

  return rawSources.flatMap(
    (source) => {
      if (!isRecord(source)) {
        return [];
      }

      const knowledgeSourceId =
        typeof source.knowledgeSourceId ===
        "string"
          ? source.knowledgeSourceId
          : undefined;

      const sourceTitle =
        typeof source.sourceTitle ===
        "string"
          ? source.sourceTitle
          : undefined;

      const chunkId =
        typeof source.chunkId ===
        "string"
          ? source.chunkId
          : undefined;

      const similarity =
        typeof source.similarity ===
        "number"
          ? source.similarity
          : undefined;

      if (
        !knowledgeSourceId ||
        !sourceTitle ||
        !chunkId
      ) {
        return [];
      }

      return [
        {
          knowledgeSourceId,
          sourceTitle,
          chunkId,
          similarity,
        },
      ];
    },
  );
}

export function ConversationMessage({
  role,
  content,
  createdAt,
  metadata,
  locale,
}: ConversationMessageProps) {
  const t = useTranslations(
    "aiEmployeeConversationDetails",
  );

  const [copied, setCopied] =
    useState(false);

  const isUser =
    role === "USER";

  const knowledgeSources = isUser
    ? []
    : parseKnowledgeSources(metadata);

  const uniqueSources =
    Array.from(
      new Map(
        knowledgeSources.map(
          (source) => [
            source.knowledgeSourceId,
            source,
          ],
        ),
      ).values(),
    );

  const dateFormatter =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        content,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error(
        "Failed to copy conversation message:",
        error,
      );
    }
  }

  return (
    <article
      className={cn(
        "group flex min-w-0 gap-2.5 sm:gap-4",
        isUser
          ? "justify-end"
          : "justify-start",
      )}
    >
      {!isUser ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40 sm:size-10">
          <Bot className="size-4 text-muted-foreground sm:size-5" />
        </span>
      ) : null}

      <div
        className={cn(
          "min-w-0 max-w-[88%] space-y-2 sm:max-w-[80%]",
          isUser
            ? "items-end"
            : "items-start",
        )}
      >
        <div
          className={cn(
            "relative min-w-0 rounded-2xl border px-3 py-3 sm:px-4",
            isUser
              ? "rounded-br-md border-primary bg-primary text-primary-foreground"
              : "rounded-bl-md bg-card",
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {content}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <time
              dateTime={createdAt.toISOString()}
              className={cn(
                "block text-[11px] leading-4",
                isUser
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {dateFormatter.format(
                createdAt,
              )}
            </time>

            <button
              type="button"
              onClick={handleCopy}
              aria-label={
                copied
                  ? t("copied")
                  : t("copyMessage")
              }
              title={
                copied
                  ? t("copied")
                  : t("copyMessage")
              }
              className={cn(
                "inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors",
                isUser
                  ? "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {uniqueSources.length > 0 ? (
          <section className="min-w-0 rounded-xl border bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 shrink-0 text-muted-foreground" />

              <p className="break-words text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("sources")}
              </p>
            </div>

            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {uniqueSources.map(
                (source) => (
                  <span
                    key={
                      source.knowledgeSourceId
                    }
                    className="inline-flex max-w-full items-center rounded-full border bg-background px-3 py-1 text-xs"
                    title={
                      source.similarity !==
                      undefined
                        ? t(
                            "similarity",
                            {
                              value:
                                source.similarity.toFixed(
                                  3,
                                ),
                            },
                          )
                        : undefined
                    }
                  >
                    <span className="max-w-full break-words">
                      {
                        source.sourceTitle
                      }
                    </span>
                  </span>
                ),
              )}
            </div>
          </section>
        ) : null}
      </div>

      {isUser ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40 sm:size-10">
          <User className="size-4 text-muted-foreground sm:size-5" />
        </span>
      ) : null}
    </article>
  );
}

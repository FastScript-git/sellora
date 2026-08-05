"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  TriangleAlert,
  UserRound,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type { ChatToolResult } from "@/features/test-chat/actions/send-message";
import { cn } from "@/lib/utils";

type ChatCitation = {
  sourceId: string;
  sourceTitle: string;
  citationNumbers: number[];
};

type ChatMessageProps = {
  role: "user" | "employee";
  content: string;
  citations?: ChatCitation[];
  toolResults?: ChatToolResult[];
};

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function splitTrailingPunctuation(
  value: string,
) {
  const match = value.match(
    /^(.*?)([),.!?;:]+)?$/,
  );

  return {
    url: match?.[1] ?? value,
    trailing: match?.[2] ?? "",
  };
}

function renderMessageContent(
  content: string,
): ReactNode[] {
  return content
    .split(URL_PATTERN)
    .map((part, index) => {
      if (
        !part.match(/^https?:\/\//)
      ) {
        return part;
      }

      const { url, trailing } =
        splitTrailingPunctuation(
          part,
        );

      return (
        <span key={`${url}-${index}`}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 break-all font-medium text-blue-600 underline decoration-blue-600/40 underline-offset-4 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>{url}</span>

            <ExternalLink
              aria-hidden="true"
              className="size-3.5 shrink-0"
            />
          </a>

          {trailing}
        </span>
      );
    });
}

function getToolPresentation(
  result: ChatToolResult,
) {
  switch (result.type) {
    case "google-calendar":
      return {
        icon: CalendarDays,
        product: "Google Calendar",
        action: "Open event",
      };

    case "google-docs":
      return {
        icon: FileText,
        product: "Google Docs",
        action: "Open document",
      };

    case "gmail":
      return {
        icon: Mail,
        product: "Gmail",
        action: "Open sent mail",
      };

    default:
      return {
        icon: Wrench,
        product: "AI Tool",
        action: "Open result",
      };
  }
}

function ToolResultCard({
  result,
}: {
  result: ChatToolResult;
}) {
  const presentation =
    getToolPresentation(result);

  const Icon =
    presentation.icon;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        result.success
          ? "border-emerald-500/20"
          : "border-destructive/30",
      )}
    >
      <div className="flex min-w-0 items-start gap-3 p-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            result.success
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : "border-destructive/20 bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
            ) : (
              <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
            )}

            <p className="truncate text-xs font-medium text-muted-foreground">
              {presentation.product}
            </p>
          </div>

          <p className="mt-1 break-words text-sm font-semibold">
            {result.title}
          </p>

          <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
            {result.description}
          </p>
        </div>
      </div>

      {result.success &&
      result.url ? (
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center justify-between gap-3 border-t px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <span className="truncate">
            {presentation.action}
          </span>

          <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
        </a>
      ) : null}
    </div>
  );
}

export function ChatMessage({
  role,
  content,
  citations = [],
  toolResults = [],
}: ChatMessageProps) {
  const t = useTranslations(
    "aiEmployeeTestChat.chat",
  );

  const isUser = role === "user";

  const hasCitations =
    !isUser &&
    citations.length > 0;

  const hasToolResults =
    !isUser &&
    toolResults.length > 0;

  return (
    <article
      className={cn(
        "flex gap-3",
        isUser &&
          "flex-row-reverse",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 text-muted-foreground",
        )}
      >
        {isUser ? (
          <UserRound className="size-4" />
        ) : (
          <Bot className="size-4" />
        )}
      </span>

      <div className="w-full max-w-[90%] space-y-2 sm:max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border bg-background text-foreground",
          )}
        >
          <p className="whitespace-pre-wrap break-words">
            {renderMessageContent(
              content,
            )}
          </p>
        </div>

        {hasToolResults ? (
          <div className="space-y-2">
            {toolResults.map(
              (result) => (
                <ToolResultCard
                  key={result.id}
                  result={result}
                />
              ),
            )}
          </div>
        ) : null}

        {hasCitations ? (
          <div className="rounded-xl border bg-muted/20 px-3 py-2.5">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
              <BookOpen className="size-3.5 text-muted-foreground" />
              {t("sourcesUsed")}
            </div>

            <ul className="space-y-1.5">
              {citations.map(
                (citation) => (
                  <li
                    key={
                      citation.sourceId
                    }
                    className="flex min-w-0 flex-col gap-1.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="break-words text-muted-foreground">
                      {
                        citation.sourceTitle
                      }
                    </span>

                    <span className="flex shrink-0 flex-wrap items-center gap-1">
                      {citation.citationNumbers.map(
                        (
                          citationNumber,
                        ) => (
                          <span
                            key={
                              citationNumber
                            }
                            className="shrink-0 rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            [{citationNumber}]
                          </span>
                        ),
                      )}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

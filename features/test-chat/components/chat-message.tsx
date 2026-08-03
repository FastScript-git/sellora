"use client";

import {
  BookOpen,
  Bot,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

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
};

export function ChatMessage({
  role,
  content,
  citations = [],
}: ChatMessageProps) {
  const t = useTranslations(
    "aiEmployeeTestChat.chat",
  );

  const isUser = role === "user";

  const hasCitations =
    !isUser &&
    citations.length > 0;

  return (
    <article
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse",
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
            {content}
          </p>
        </div>

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

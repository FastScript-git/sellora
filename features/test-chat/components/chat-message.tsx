import {
  BookOpen,
  Bot,
  UserRound,
} from "lucide-react";

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
  const isUser = role === "user";
  const hasCitations = !isUser && citations.length > 0;

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

      <div className="max-w-[80%] space-y-2">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border bg-card text-foreground",
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
              Sources
            </div>

            <ul className="space-y-1.5">
              {citations.map((citation) => (
                <li
                  key={citation.sourceId}
                  className="flex min-w-0 items-center justify-between gap-3 text-xs"
                >
                  <span className="truncate text-muted-foreground">
                    {citation.sourceTitle}
                  </span>

                  <span className="flex shrink-0 items-center gap-1">
                    {citation.citationNumbers.map(
                      (citationNumber) => (
                        <span
                          key={citationNumber}
                          className="rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          [{citationNumber}]
                        </span>
                      ),
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

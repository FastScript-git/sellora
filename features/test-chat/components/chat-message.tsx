import { Bot, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type ChatMessageProps = {
  role: "user" | "employee";
  content: string;
};

export function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser = role === "user";

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

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6",
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md border bg-card text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>
    </article>
  );
}
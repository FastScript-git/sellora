import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ConversationRole } from "@/lib/generated/prisma/client";

type ConversationMessageProps = {
  role: ConversationRole;
  content: string;
  createdAt: Date;
};

export function ConversationMessage({
  role,
  content,
  createdAt,
}: ConversationMessageProps) {
  const isUser = role === "USER";

  return (
    <div
      className={cn(
        "flex gap-4",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </span>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl border px-4 py-3",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-card",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">
          {content}
        </p>

        <p
          className={cn(
            "mt-3 text-[11px]",
            isUser
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {createdAt.toLocaleString()}
        </p>
      </div>

      {isUser && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
          <User className="h-5 w-5 text-muted-foreground" />
        </span>
      )}
    </div>
  );
}
"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  ConversationRole,
  Prisma,
} from "@/lib/generated/prisma/client";
import { ConversationMessage } from "@/features/conversations/components/conversation-message";

type ConversationMessageItem = {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: Date;
  metadata: Prisma.JsonValue | null;
};

type ConversationMessageListProps = {
  messages: ConversationMessageItem[];
  locale: string;
};

export function ConversationMessageList({
  messages,
  locale,
}: ConversationMessageListProps) {
  const endRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  return (
    <div className="min-w-0 space-y-5 px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      {messages.map((message) => (
        <ConversationMessage
          key={message.id}
          role={message.role}
          content={message.content}
          createdAt={message.createdAt}
          metadata={message.metadata}
          locale={locale}
        />
      ))}

      <div ref={endRef} />
    </div>
  );
}

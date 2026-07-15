"use client";

import { FormEvent, useState } from "react";
import { Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/features/test-chat/components/chat-message";

type ChatMessageItem = {
  id: string;
  role: "user" | "employee";
  content: string;
};

type TestChatPanelProps = {
  employeeName: string;
};

export function TestChatPanel({
  employeeName,
}: TestChatPanelProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "welcome",
      role: "employee",
      content: `Hello! I’m ${employeeName}. Send me a message to test how I respond.`,
    },
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage: ChatMessageItem = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    const employeeMessage: ChatMessageItem = {
      id: crypto.randomUUID(),
      role: "employee",
      content:
        "This is a test response. Live AI responses will be connected in the next step.",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      employeeMessage,
    ]);

    setMessage("");
  }

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border bg-card">
      <header className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">Test Chat</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Test this AI Employee before connecting a live channel.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          Preview mode
        </span>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {messages.map((chatMessage) => (
          <ChatMessage
            key={chatMessage.id}
            role={chatMessage.role}
            content={chatMessage.content}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background/60 p-4"
      >
        <div className="flex items-end gap-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={`Message ${employeeName}...`}
            rows={2}
            className="min-h-20 resize-none"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Test mode does not contact customers or connected channels.
        </p>
      </form>
    </section>
  );
}
"use client";

import {
  Bot,
  Check,
  Copy,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export type WidgetMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  deliveryStatus?:
    | "sending"
    | "sent"
    | "failed";
};

type WidgetChatMessageProps = {
  message: WidgetMessage;
  primaryColor: string;
  embedded: boolean;
  locale: string;
};

function formatMessageTime(
  createdAt: string,
) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export function WidgetChatMessage({
  message,
  primaryColor,
  embedded,
  locale,
}: WidgetChatMessageProps) {
  const [copied, setCopied] =
    useState(false);

  const isUser =
    message.role === "USER";

  const isUkrainian =
    locale === "uk";

  const copyLabel = copied
    ? isUkrainian
      ? "Скопійовано"
      : "Copied"
    : isUkrainian
      ? "Копіювати"
      : "Copy";

  const sendingLabel = isUkrainian
    ? "Надсилання..."
    : "Sending...";

  const failedLabel = isUkrainian
    ? "Не надіслано"
    : "Not sent";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        message.content,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error(
        "Failed to copy widget message:",
        error,
      );
    }
  }

  return (
    <div
      className={
        isUser
          ? "flex justify-end"
          : "group/message flex justify-start"
      }
    >
      <div className="flex max-w-[92%] items-end gap-2 sm:max-w-[88%]">
        {!isUser ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor:
                primaryColor,
            }}
          >
            <Bot className="size-3.5" />
          </span>
        ) : null}

        <div className="min-w-0">
          <div
            className={
              isUser
                ? "rounded-2xl rounded-br-md px-4 py-3 text-white shadow-sm"
                : embedded
                  ? "rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 text-zinc-950 shadow-sm"
                  : "rounded-2xl rounded-bl-md border bg-background px-4 py-3 shadow-sm"
            }
            style={
              isUser
                ? {
                    backgroundColor:
                      primaryColor,
                  }
                : undefined
            }
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {message.content}
            </p>

            <div
              className={
                isUser
                  ? "mt-1.5 flex items-center justify-end gap-2 text-[10px] text-white/70"
                  : "mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground"
              }
            >
              <time
                dateTime={
                  message.createdAt
                }
              >
                {formatMessageTime(
                  message.createdAt,
                )}
              </time>

              {isUser &&
              message.deliveryStatus ===
                "sending" ? (
                <span>
                  {sendingLabel}
                </span>
              ) : null}

              {isUser &&
              message.deliveryStatus ===
                "failed" ? (
                <span className="font-medium text-red-100">
                  {failedLabel}
                </span>
              ) : null}
            </div>
          </div>

          {!isUser ? (
            <div className="mt-1 flex justify-start pl-1">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[10px] font-medium text-zinc-500 opacity-70 transition-all hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:opacity-0 sm:group-hover/message:opacity-100 sm:focus-visible:opacity-100"
                aria-label={copyLabel}
                title={copyLabel}
              >
                {copied ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}

                {copyLabel}
              </button>
            </div>
          ) : null}
        </div>

        {isUser ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
            <UserRound className="size-3.5 text-muted-foreground" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

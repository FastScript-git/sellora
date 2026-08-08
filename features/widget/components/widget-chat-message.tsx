"use client";

import {
  Bot,
  Check,
  Copy,
  ExternalLink,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

type MarkdownCodeBlockProps = {
  code: string;
  language: string;
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

function formatLanguageLabel(
  language: string,
) {
  const normalized =
    language.toLowerCase();

  const labels: Record<
    string,
    string
  > = {
    js: "JavaScript",
    javascript: "JavaScript",
    jsx: "JSX",
    ts: "TypeScript",
    typescript: "TypeScript",
    tsx: "TSX",
    json: "JSON",
    html: "HTML",
    css: "CSS",
    bash: "Bash",
    shell: "Shell",
    sh: "Shell",
    python: "Python",
    py: "Python",
    sql: "SQL",
    markdown: "Markdown",
    md: "Markdown",
    text: "Text",
  };

  return (
    labels[normalized] ||
    language ||
    "Code"
  );
}

function MarkdownCodeBlock({
  code,
  language,
  locale,
}: MarkdownCodeBlockProps) {
  const [copied, setCopied] =
    useState(false);

  const isUkrainian =
    locale === "uk";

  const copyLabel = copied
    ? isUkrainian
      ? "Скопійовано"
      : "Copied"
    : isUkrainian
      ? "Копіювати"
      : "Copy";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        code,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error(
        "Failed to copy widget code block:",
        error,
      );
    }
  }

  return (
    <div className="my-3 min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/90 px-3 py-2">
        <span className="min-w-0 truncate text-[10px] font-medium text-zinc-400">
          {formatLanguageLabel(
            language,
          )}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[10px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
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

      <div className="max-w-full overflow-x-auto">
        <code className="block min-w-max whitespace-pre px-3 py-3 font-mono text-[11px] leading-5 text-zinc-100">
          {code}
        </code>
      </div>
    </div>
  );
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
      <div
        className={
          isUser
            ? "flex max-w-[88%] items-end gap-2 sm:max-w-[82%]"
            : "flex max-w-[96%] items-start gap-2 sm:max-w-[94%]"
        }
      >
        {!isUser ? (
          <span
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
            style={{
              backgroundColor:
                primaryColor,
            }}
          >
            <Bot className="size-3.5" />
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <div
            className={
              isUser
                ? "rounded-2xl rounded-br-md px-4 py-3 text-white shadow-sm"
                : embedded
                  ? "min-w-0 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 text-zinc-950 shadow-sm"
                  : "min-w-0 rounded-2xl rounded-bl-md border bg-background px-4 py-3 shadow-sm"
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
            {isUser ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {message.content}
              </p>
            ) : (
              <div className="min-w-0 overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                  ]}
                  components={{
                    p({ children }) {
                      return (
                        <p className="my-2 break-words text-sm leading-6 first:mt-0 last:mb-0">
                          {children}
                        </p>
                      );
                    },

                    strong({
                      children,
                    }) {
                      return (
                        <strong className="font-semibold">
                          {children}
                        </strong>
                      );
                    },

                    em({ children }) {
                      return (
                        <em className="italic">
                          {children}
                        </em>
                      );
                    },

                    h1({ children }) {
                      return (
                        <h1 className="mb-2 mt-4 text-base font-semibold leading-6 tracking-tight first:mt-0">
                          {children}
                        </h1>
                      );
                    },

                    h2({ children }) {
                      return (
                        <h2 className="mb-2 mt-4 text-[15px] font-semibold leading-6 tracking-tight first:mt-0">
                          {children}
                        </h2>
                      );
                    },

                    h3({ children }) {
                      return (
                        <h3 className="mb-1.5 mt-3 text-sm font-semibold leading-6 first:mt-0">
                          {children}
                        </h3>
                      );
                    },

                    ul({ children }) {
                      return (
                        <ul className="my-2.5 list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-muted-foreground">
                          {children}
                        </ul>
                      );
                    },

                    ol({ children }) {
                      return (
                        <ol className="my-2.5 list-decimal space-y-1.5 pl-5 text-sm leading-6 marker:font-medium marker:text-muted-foreground">
                          {children}
                        </ol>
                      );
                    },

                    li({ children }) {
                      return (
                        <li className="pl-0.5">
                          {children}
                        </li>
                      );
                    },

                    blockquote({
                      children,
                    }) {
                      return (
                        <blockquote
                          className={
                            embedded
                              ? "my-3 rounded-r-lg border-l-2 border-zinc-300 bg-zinc-50 py-2 pl-3 pr-2 text-sm leading-6 text-zinc-600"
                              : "my-3 rounded-r-lg border-l-2 border-border bg-muted/30 py-2 pl-3 pr-2 text-sm leading-6 text-muted-foreground"
                          }
                        >
                          {children}
                        </blockquote>
                      );
                    },

                    a({
                      href,
                      children,
                    }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline font-medium underline decoration-current/40 underline-offset-2 transition-opacity hover:opacity-70"
                        >
                          {children}

                          <ExternalLink className="ml-1 inline size-3 align-[-1px]" />
                        </a>
                      );
                    },

                    code({
                      className,
                      children,
                    }) {
                      const language =
                        className?.replace(
                          /^language-/,
                          "",
                        );

                      const code =
                        String(
                          children,
                        ).replace(
                          /\n$/,
                          "",
                        );

                      if (language) {
                        return (
                          <MarkdownCodeBlock
                            code={code}
                            language={
                              language
                            }
                            locale={
                              locale
                            }
                          />
                        );
                      }

                      return (
                        <code
                          className={
                            embedded
                              ? "rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-900"
                              : "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
                          }
                        >
                          {children}
                        </code>
                      );
                    },

                    pre({
                      children,
                    }) {
                      return (
                        <>{children}</>
                      );
                    },

                    table({
                      children,
                    }) {
                      return (
                        <div
                          className={
                            embedded
                              ? "my-3 max-w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white"
                              : "my-3 max-w-full overflow-x-auto rounded-xl border bg-background"
                          }
                        >
                          <table className="w-full min-w-max border-collapse text-left text-xs">
                            {children}
                          </table>
                        </div>
                      );
                    },

                    thead({
                      children,
                    }) {
                      return (
                        <thead
                          className={
                            embedded
                              ? "bg-zinc-50 text-zinc-700"
                              : "bg-muted/50"
                          }
                        >
                          {children}
                        </thead>
                      );
                    },

                    tbody({
                      children,
                    }) {
                      return (
                        <tbody className="[&_tr:last-child_td]:border-b-0">
                          {children}
                        </tbody>
                      );
                    },

                    tr({ children }) {
                      return (
                        <tr className="transition-colors hover:bg-muted/20">
                          {children}
                        </tr>
                      );
                    },

                    th({ children }) {
                      return (
                        <th
                          className={
                            embedded
                              ? "border-b border-r border-zinc-200 px-3 py-2.5 font-semibold last:border-r-0"
                              : "border-b border-r px-3 py-2.5 font-semibold last:border-r-0"
                          }
                        >
                          {children}
                        </th>
                      );
                    },

                    td({ children }) {
                      return (
                        <td
                          className={
                            embedded
                              ? "border-b border-r border-zinc-200 px-3 py-2.5 align-top leading-5 last:border-r-0"
                              : "border-b border-r px-3 py-2.5 align-top leading-5 last:border-r-0"
                          }
                        >
                          {children}
                        </td>
                      );
                    },

                    hr() {
                      return (
                        <hr
                          className={
                            embedded
                              ? "my-4 border-zinc-200"
                              : "my-4 border-border"
                          }
                        />
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            <div
              className={
                isUser
                  ? "mt-1.5 flex items-center justify-end gap-2 text-[10px] text-white/75"
                  : "mt-2 flex items-center gap-2 text-[10px] text-muted-foreground"
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
                className={
                  embedded
                    ? "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[10px] font-medium text-zinc-500 opacity-70 transition-all hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:opacity-0 sm:group-hover/message:opacity-100 sm:focus-visible:opacity-100"
                    : "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[10px] font-medium text-muted-foreground opacity-70 transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover/message:opacity-100 sm:focus-visible:opacity-100"
                }
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

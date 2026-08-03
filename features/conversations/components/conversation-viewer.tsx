import {
  Bot,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversationThread } from "@/features/conversations/components/conversation-thread";
import { getConversationDetails } from "@/features/conversations/services/get-conversation-details";

type ConversationViewerProps = {
  conversationId: string;
  employeeId: string;
  workspaceId: string;
  locale: string;
};

export async function ConversationViewer({
  conversationId,
  employeeId,
  workspaceId,
  locale,
}: ConversationViewerProps) {
  const conversation =
    await getConversationDetails({
      conversationId,
      employeeId,
      workspaceId,
    });

  if (!conversation) {
    notFound();
  }

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        fallbackTitle: "Розмова",
        messages: "повідомлень",
        empty:
          "У цій розмові поки немає повідомлень.",
        employee: "ШІ-співробітник",
        contact: "Контакт",
        anonymous:
          "Анонімний відвідувач",
        aiSummary: "AI-резюме",
        noSummary:
          "AI-резюме поки не створено.",
        leadScore: "Оцінка ліда",
        sentiment: "Настрій",
      }
    : {
        fallbackTitle: "Conversation",
        messages: "messages",
        empty:
          "This conversation does not contain messages yet.",
        employee: "AI Employee",
        contact: "Contact",
        anonymous:
          "Anonymous visitor",
        aiSummary: "AI Summary",
        noSummary:
          "No AI summary yet.",
        leadScore: "Lead score",
        sentiment: "Sentiment",
      };

  const contactName =
    conversation.contact
      ? [
          conversation.contact
            .firstName,
          conversation.contact
            .lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        conversation.contact.email ||
        copy.anonymous
      : null;

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="break-words text-lg sm:text-xl">
                {conversation.title ||
                  copy.fallbackTitle}
              </CardTitle>

              <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                {
                  conversation.employee
                    .name
                }
              </p>
            </div>

            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5 shrink-0" />

              {
                conversation.messages
                  .length
              }{" "}
              {copy.messages}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {conversation.messages
            .length === 0 ? (
            <div className="flex min-h-80 items-center justify-center px-4 py-12 text-center sm:min-h-96 sm:px-6">
              <p className="max-w-md break-words text-sm leading-6 text-muted-foreground">
                {copy.empty}
              </p>
            </div>
          ) : (
            <ConversationThread
              conversationId={conversation.id}
              initialMessages={conversation.messages}
              locale={locale}
            />
          )}
        </CardContent>
      </Card>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:space-y-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words text-base">
              {copy.employee}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                <Bot className="size-4 text-muted-foreground" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">
                  {
                    conversation.employee
                      .name
                  }
                </p>

                <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                  {
                    conversation.employee
                      .role
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {conversation.contact ? (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="break-words text-base">
                {copy.contact}
              </CardTitle>
            </CardHeader>

            <CardContent className="min-w-0 space-y-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <UserRound className="size-4 text-muted-foreground" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium">
                    {contactName}
                  </p>

                  <p className="mt-1 break-all text-sm leading-5 text-muted-foreground">
                    {conversation.contact
                      .email || "—"}
                  </p>
                </div>
              </div>

              <section className="min-w-0 rounded-xl border bg-background/50 p-4">
                <p className="break-words text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {copy.aiSummary}
                </p>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {conversation.contact
                    .summary ||
                    copy.noSummary}
                </p>
              </section>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between xl:flex-row">
                  <span className="break-words text-sm text-muted-foreground">
                    {copy.leadScore}
                  </span>

                  <span className="shrink-0 font-semibold tabular-nums">
                    {conversation.contact
                      .leadScore !== null
                      ? `${conversation.contact.leadScore}/100`
                      : "—"}
                  </span>
                </div>

                <div className="flex min-w-0 flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between xl:flex-row">
                  <span className="break-words text-sm text-muted-foreground">
                    {copy.sentiment}
                  </span>

                  <span className="break-words text-sm font-medium">
                    {
                      conversation.contact
                        .sentiment
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

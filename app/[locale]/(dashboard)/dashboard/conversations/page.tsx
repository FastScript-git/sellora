export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Bot,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversationMessage } from "@/features/conversations/components/conversation-message";
import {
  getWorkspaceInbox,
  getWorkspaceInboxConversation,
} from "@/features/conversations/repositories/inbox.repository";
import { cn } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ConversationsPageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function ConversationsPage({
  params,
  searchParams,
}: ConversationsPageProps) {
  const { locale } = await params;
  const { conversationId } = await searchParams;

  const workspace = await getCurrentWorkspace();

  const conversations = await getWorkspaceInbox({
    workspaceId: workspace.id,
  });

  const selectedConversationId =
    conversationId ?? conversations[0]?.id;

  const selectedConversation = selectedConversationId
    ? await getWorkspaceInboxConversation({
        workspaceId: workspace.id,
        conversationId: selectedConversationId,
      })
    : null;

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Розмови",
        description:
          "Усі діалоги клієнтів в одному робочому просторі.",
        inbox: "Вхідні",
        conversations: "розмов",
        emptyTitle: "Розмов поки немає",
        emptyDescription:
          "Нові діалоги з Website Chat та підключених каналів з’являтимуться тут.",
        selectTitle: "Виберіть розмову",
        selectDescription:
          "Оберіть діалог зі списку, щоб переглянути повідомлення.",
        fallbackTitle: "Нова розмова",
        noPreview: "Повідомлень поки немає.",
        noMessages: "У цій розмові поки немає повідомлень.",
        messages: "повідомлень",
        employee: "ШІ-співробітник",
        contact: "Контакт",
        anonymous: "Анонімний відвідувач",
        noChannel: "Канал не визначено",
        leadScore: "Оцінка ліда",
        sentiment: "Настрій",
      }
    : {
        title: "Conversations",
        description:
          "All customer conversations in one workspace.",
        inbox: "Inbox",
        conversations: "conversations",
        emptyTitle: "No conversations yet",
        emptyDescription:
          "New conversations from Website Chat and connected channels will appear here.",
        selectTitle: "Select a conversation",
        selectDescription:
          "Choose a conversation from the list to view its messages.",
        fallbackTitle: "New conversation",
        noPreview: "No messages yet.",
        noMessages:
          "This conversation does not contain messages yet.",
        messages: "messages",
        employee: "AI Employee",
        contact: "Contact",
        anonymous: "Anonymous visitor",
        noChannel: "Channel not assigned",
        leadScore: "Lead score",
        sentiment: "Sentiment",
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const selectedContactName = selectedConversation?.contact
    ? [
        selectedConversation.contact.firstName,
        selectedConversation.contact.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      selectedConversation.contact.email ||
      copy.anonymous
    : copy.anonymous;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          {copy.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </section>

      {conversations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[520px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
              <Inbox className="size-5 text-muted-foreground" />
            </span>

            <h2 className="mt-5 text-lg font-semibold">
              {copy.emptyTitle}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid min-h-[680px] overflow-hidden rounded-2xl border bg-card lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-b lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  {copy.inbox}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {conversations.length} {copy.conversations}
                </p>
              </div>

              <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <Inbox className="size-4 text-muted-foreground" />
              </span>
            </div>

            <div className="max-h-[620px] overflow-y-auto">
              {conversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[0];

                const isSelected =
                  conversation.id ===
                  selectedConversation?.id;

                const conversationTitle =
                  conversation.contact
                    ? [
                        conversation.contact.firstName,
                        conversation.contact.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      conversation.contact.email ||
                      conversation.title ||
                      copy.fallbackTitle
                    : conversation.title ||
                      copy.fallbackTitle;

                const lastActivityAt =
                  conversation.lastMessageAt ??
                  lastMessage?.createdAt ??
                  conversation.updatedAt;

                return (
                  <Link
                    key={conversation.id}
                    href={`/${locale}/dashboard/conversations?conversationId=${conversation.id}`}
                    className={cn(
                      "block border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40",
                      isSelected && "bg-muted/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                        <UserRound className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-medium">
                            {conversationTitle}
                          </p>

                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {dateFormatter.format(
                              lastActivityAt,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {lastMessage?.content ||
                            copy.noPreview}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {conversation.status}
                          </Badge>

                          <Badge variant="secondary">
                            {conversation.channel?.type ||
                              "TEST"}
                          </Badge>

                          {conversation.unreadCount > 0 ? (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0">
            {!selectedConversation ? (
              <div className="flex min-h-[680px] flex-col items-center justify-center px-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
                  <MessageSquare className="size-5 text-muted-foreground" />
                </span>

                <h2 className="mt-5 text-lg font-semibold">
                  {copy.selectTitle}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {copy.selectDescription}
                </p>
              </div>
            ) : (
              <div className="grid min-h-[680px] xl:grid-cols-[minmax(0,1fr)_300px]">
                <section className="flex min-w-0 flex-col">
                  <header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">
                        {selectedConversation.title ||
                          selectedContactName ||
                          copy.fallbackTitle}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {selectedConversation.status}
                        </Badge>

                        <Badge variant="secondary">
                          {selectedConversation.channel
                            ?.type || "TEST"}
                        </Badge>
                      </div>
                    </div>

                    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      {
                        selectedConversation._count
                          .messages
                      }{" "}
                      {copy.messages}
                    </span>
                  </header>

                  <div className="max-h-[600px] flex-1 overflow-y-auto">
                    {selectedConversation.messages.length ===
                    0 ? (
                      <div className="flex min-h-[500px] items-center justify-center px-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          {copy.noMessages}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5 px-5 py-6">
                        {selectedConversation.messages.map(
                          (message) => (
                            <ConversationMessage
                              key={message.id}
                              role={message.role}
                              content={message.content}
                              createdAt={
                                message.createdAt
                              }
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <aside className="space-y-6 border-t bg-muted/10 p-5 xl:border-l xl:border-t-0">
                  <section>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {copy.employee}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                        <Bot className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {
                            selectedConversation.employee
                              .name
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {
                            selectedConversation.employee
                              .role
                          }
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="border-t pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {copy.contact}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                        <UserRound className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {selectedContactName}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {selectedConversation.contact
                            ?.company || "—"}
                        </p>
                      </div>
                    </div>

                    {selectedConversation.contact ? (
                      <div className="mt-4 space-y-2">
                        {selectedConversation.contact
                          .email ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="size-3.5 shrink-0" />

                            <span className="truncate">
                              {
                                selectedConversation
                                  .contact.email
                              }
                            </span>
                          </div>
                        ) : null}

                        {selectedConversation.contact
                          .phone ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="size-3.5 shrink-0" />

                            <span className="truncate">
                              {
                                selectedConversation
                                  .contact.phone
                              }
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </section>

                  <section className="space-y-3 border-t pt-5">
                    <div className="flex items-center justify-between rounded-xl border bg-background px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">
                        {copy.leadScore}
                      </span>

                      <span className="text-sm font-semibold tabular-nums">
                        {selectedConversation.contact
                          ?.leadScore !== null &&
                        selectedConversation.contact
                          ?.leadScore !== undefined
                          ? `${selectedConversation.contact.leadScore}/100`
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border bg-background px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">
                        {copy.sentiment}
                      </span>

                      <span className="text-xs font-medium">
                        {selectedConversation.contact
                          ?.sentiment || "—"}
                      </span>
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
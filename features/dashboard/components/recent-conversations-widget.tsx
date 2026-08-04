import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  Globe2,
  MessageSquare,
  MessagesSquare,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ChannelType,
  ContactStatus,
  ConversationRole,
  ConversationStatus,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type RecentConversation = {
  id: string;
  title: string | null;
  status: ConversationStatus;
  updatedAt: Date;
  lastMessageAt: Date | null;
  unreadCount: number;

  employee: {
    id: string;
    name: string;
  };

  channel: {
    id: string;
    name: string;
    type: ChannelType;
  } | null;

  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    company: string | null;
    status: ContactStatus;
    leadScore: number | null;
  } | null;

  messages: Array<{
    id: string;
    role: ConversationRole;
    content: string;
    createdAt: Date;
  }>;

  _count: {
    messages: number;
  };
};

type RecentConversationsWidgetProps = {
  conversations: RecentConversation[];
  locale: string;
};

export function RecentConversationsWidget({
  conversations,
  locale,
}: RecentConversationsWidgetProps) {
  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        title:
          "Останні розмови",
        description:
          "Найновіші діалоги з клієнтами.",
        viewAll:
          "Відкрити Inbox",
        emptyTitle:
          "Розмов поки немає",
        emptyDescription:
          "Нові діалоги з клієнтами з’являтимуться тут.",
        anonymous:
          "Анонімний відвідувач",
        noMessage:
          "Повідомлень поки немає",
        openConversation:
          "Відкрити розмову",
        messages:
          "повідомлень",
        leadScore:
          "Lead Score",
        company:
          "Компанія",
        channel:
          "Канал",
      }
    : {
        title:
          "Recent conversations",
        description:
          "The latest customer conversations.",
        viewAll:
          "Open Inbox",
        emptyTitle:
          "No conversations yet",
        emptyDescription:
          "New customer conversations will appear here.",
        anonymous:
          "Anonymous visitor",
        noMessage:
          "No messages yet",
        openConversation:
          "Open conversation",
        messages:
          "messages",
        leadScore:
          "Lead score",
        company:
          "Company",
        channel:
          "Channel",
      };

  const dateFormatter =
    new Intl.DateTimeFormat(
      isUkrainian
        ? "uk-UA"
        : "en-US",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  const visibleConversations =
    conversations.slice(0, 4);

  const inboxHref =
    `/${locale}/dashboard/conversations`;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {copy.title}
            </CardTitle>

            <CardDescription className="mt-1">
              {copy.description}
            </CardDescription>
          </div>

          <Link
            href={inboxHref}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "h-8 w-full shrink-0 justify-center gap-1.5 px-2 text-xs sm:w-auto",
            )}
          >
            {copy.viewAll}

            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {visibleConversations.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
              <MessageSquare className="size-5 text-muted-foreground" />
            </span>

            <p className="mt-5 text-base font-semibold">
              {copy.emptyTitle}
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {visibleConversations.map(
              (conversation) => {
                const latestMessage =
                  conversation.messages[0];

                const contactName =
                  conversation.contact
                    ? [
                        conversation.contact.firstName,
                        conversation.contact.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      conversation.contact.email ||
                      copy.anonymous
                    : copy.anonymous;

                const activityDate =
                  conversation.lastMessageAt ??
                  latestMessage?.createdAt ??
                  conversation.updatedAt;

                const conversationHref =
                  `${inboxHref}?conversationId=${conversation.id}`;

                return (
                  <Link
                    key={conversation.id}
                    href={conversationHref}
                    aria-label={
                      copy.openConversation
                    }
                    className="group block min-w-0 px-4 py-4 outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25 sm:px-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <UserRound className="size-4 text-muted-foreground" />

                        {conversation.unreadCount > 0 ? (
                          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-card bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {
                              conversation.unreadCount
                            }
                          </span>
                        ) : null}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="max-w-full truncate text-sm font-semibold">
                                {contactName}
                              </p>

                              {conversation.channel ? (
                                <Badge
                                  variant="outline"
                                  className="h-5 shrink-0 px-1.5 text-[10px]"
                                >
                                  {
                                    conversation.channel
                                      .type
                                  }
                                </Badge>
                              ) : null}
                            </div>

                            <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                              {latestMessage?.content ||
                                copy.noMessage}
                            </p>
                          </div>

                          <time
                            dateTime={activityDate.toISOString()}
                            className="shrink-0 text-[11px] text-muted-foreground"
                          >
                            {dateFormatter.format(
                              activityDate,
                            )}
                          </time>
                        </div>

                        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                          <ConversationMeta
                            icon={Bot}
                            label={
                              conversation.employee.name
                            }
                          />

                          <ConversationMeta
                            icon={
                              MessagesSquare
                            }
                            label={`${conversation._count.messages} ${copy.messages}`}
                          />

                          <ConversationMeta
                            icon={Building2}
                            label={
                              conversation.contact
                                ?.company ||
                              copy.company
                            }
                          />

                          <ConversationMeta
                            icon={Globe2}
                            label={
                              conversation.channel
                                ?.name ||
                              copy.channel
                            }
                          />
                        </div>

                        {conversation.contact
                          ?.leadScore !==
                        null &&
                        conversation.contact
                          ?.leadScore !==
                          undefined ? (
                          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2">
                            <span className="text-xs text-muted-foreground">
                              {copy.leadScore}
                            </span>

                            <span className="text-xs font-semibold tabular-nums">
                              {
                                conversation.contact
                                  .leadScore
                              }
                              /100
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <ArrowRight className="mt-1 hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type ConversationMetaProps = {
  icon: typeof Bot;
  label: string;
};

function ConversationMeta({
  icon: Icon,
  label,
}: ConversationMetaProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background/50 px-3 py-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />

      <span className="truncate text-[11px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

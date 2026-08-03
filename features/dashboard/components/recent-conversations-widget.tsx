import Link from "next/link";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Останні розмови",
        description:
          "Найновіші діалоги з клієнтами.",
        viewAll: "Inbox",
        emptyTitle: "Розмов поки немає",
        emptyDescription:
          "Нові діалоги з’являтимуться тут.",
        anonymous: "Анонімний відвідувач",
        noMessage: "Повідомлень поки немає",
      }
    : {
        title: "Recent conversations",
        description:
          "The latest customer conversations.",
        viewAll: "Inbox",
        emptyTitle: "No conversations yet",
        emptyDescription:
          "New conversations will appear here.",
        anonymous: "Anonymous visitor",
        noMessage: "No messages yet",
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const visibleConversations =
    conversations.slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{copy.title}</CardTitle>

            <CardDescription className="mt-1">
              {copy.description}
            </CardDescription>
          </div>

          <Link
            href={`/${locale}/dashboard/conversations`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {copy.viewAll}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {visibleConversations.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-7 text-center">
            <MessageSquare className="size-4 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              {copy.emptyTitle}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
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

                return (
                  <Link
                    key={conversation.id}
                    href={
                      `/${locale}/dashboard/conversations` +
                      `?conversationId=${conversation.id}`
                    }
                    className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/30"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                      <UserRound className="size-4 text-muted-foreground" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {contactName}
                        </p>

                        {conversation.unreadCount > 0 ? (
                          <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {latestMessage?.content ||
                          copy.noMessage}
                      </p>

                      <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Bot className="size-3 shrink-0" />

                          <span className="truncate">
                            {conversation.employee.name}
                          </span>
                        </span>

                        {conversation.channel ? (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            {conversation.channel.type}
                          </Badge>
                        ) : null}

                        <span className="ml-auto shrink-0">
                          {dateFormatter.format(
                            activityDate,
                          )}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
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

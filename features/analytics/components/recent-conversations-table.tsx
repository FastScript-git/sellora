import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RecentConversation = {
  id: string;
  title: string | null;
  updatedAt: Date;
  contact: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  messages: Array<{
    content: string;
    createdAt: Date;
  }>;
  _count: {
    messages: number;
  };
};

type RecentConversationsTableProps = {
  conversations: RecentConversation[];
  employeeId: string;
  locale: string;
};

export function RecentConversationsTable({
  conversations,
  employeeId,
  locale,
}: RecentConversationsTableProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Останні розмови",
        empty: "Розмов поки немає.",
        anonymous: "Анонімний відвідувач",
        noMessage: "Повідомлень ще немає",
        messages: "повідомлень",
      }
    : {
        title: "Recent conversations",
        empty: "No conversations yet.",
        anonymous: "Anonymous visitor",
        noMessage: "No messages yet",
        messages: "messages",
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>

      <CardContent>
        {conversations.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {copy.empty}
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            {conversations.map((conversation) => {
              const latestMessage = conversation.messages[0];

              const contactName = conversation.contact
                ? [
                    conversation.contact.firstName,
                    conversation.contact.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  conversation.contact.email ||
                  copy.anonymous
                : copy.anonymous;

              const href =
                `/${locale}/dashboard/employees/${employeeId}` +
                `/conversations/${conversation.id}`;

              return (
                <Link
                  key={conversation.id}
                  href={href}
                  className="group grid gap-4 p-4 transition-colors hover:bg-muted/30 sm:grid-cols-[220px_minmax(0,1fr)_120px_160px_24px] sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                      <UserRound className="size-4 text-muted-foreground" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {contactName}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {conversation.title || "Conversation"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />

                    <p className="truncate text-sm text-muted-foreground">
                      {latestMessage?.content || copy.noMessage}
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {conversation._count.messages} {copy.messages}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {dateFormatter.format(conversation.updatedAt)}
                  </span>

                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
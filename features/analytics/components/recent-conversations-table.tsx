import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
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
  const t = useTranslations(
    "aiEmployeeAnalytics.recentConversations",
  );

  const dateFormatter =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b px-4 py-4">
        <CardTitle className="break-words text-base">
          {t("title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("empty")}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map(
              (conversation) => {
                const latestMessage =
                  conversation.messages[0];

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
                      conversation.contact
                        .email ||
                      t("anonymous")
                    : t("anonymous");

                const href =
                  `/${locale}/dashboard/employees/${employeeId}` +
                  `/conversations/${conversation.id}`;

                return (
                  <Link
                    key={conversation.id}
                    href={href}
                    aria-label={t("open")}
                    className="group block min-w-0 px-4 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <UserRound className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium sm:truncate">
                              {contactName}
                            </p>

                            <p className="mt-1 break-words text-xs leading-5 text-muted-foreground sm:truncate">
                              {conversation.title ||
                                t("conversation")}
                            </p>
                          </div>

                          <time
                            dateTime={conversation.updatedAt.toISOString()}
                            className="shrink-0 text-[11px] leading-5 text-muted-foreground"
                          >
                            {dateFormatter.format(
                              conversation.updatedAt,
                            )}
                          </time>
                        </div>

                        <div className="mt-3 flex min-w-0 items-start gap-2">
                          <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                          <p className="min-w-0 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                            {latestMessage?.content ||
                              t("noMessage")}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <Badge
                            variant="outline"
                            className="max-w-full whitespace-normal text-left"
                          >
                            {t("messageCount", {
                              count:
                                conversation
                                  ._count
                                  .messages,
                            })}
                          </Badge>

                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
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

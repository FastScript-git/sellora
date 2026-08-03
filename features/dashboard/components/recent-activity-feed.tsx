import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  MessageSquare,
  Plus,
  UserRound,
} from "lucide-react";

import type {
  DashboardActivityItem,
  DashboardActivityType,
} from "@/features/dashboard/repositories/dashboard.repository";
import { cn } from "@/lib/utils";

type RecentActivityFeedProps = {
  items: DashboardActivityItem[];
  locale: string;
};

const activityIcons: Record<
  DashboardActivityType,
  typeof UserRound
> = {
  CONTACT_CREATED: UserRound,
  CONVERSATION_UPDATED: MessageSquare,
  TASK_CREATED: Plus,
  TASK_COMPLETED: CheckCircle2,
  MEETING_CREATED: CalendarPlus,
};

export function RecentActivityFeed({
  items,
  locale,
}: RecentActivityFeedProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        emptyTitle: "Активності поки немає",
        emptyDescription:
          "Нові контакти, розмови, завдання та зустрічі з’являтимуться тут.",
        labels: {
          CONTACT_CREATED: "Новий контакт",
          CONVERSATION_UPDATED: "Розмову оновлено",
          TASK_CREATED: "Нове завдання",
          TASK_COMPLETED: "Завдання виконано",
          MEETING_CREATED: "Створено зустріч",
        },
      }
    : {
        emptyTitle: "No recent activity",
        emptyDescription:
          "New contacts, conversations, tasks and meetings will appear here.",
        labels: {
          CONTACT_CREATED: "New contact",
          CONVERSATION_UPDATED:
            "Conversation updated",
          TASK_CREATED: "New task",
          TASK_COMPLETED: "Task completed",
          MEETING_CREATED: "Meeting created",
        },
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

  if (items.length === 0) {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-7 text-center">
        <MessageSquare className="size-4 text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">
          {copy.emptyTitle}
        </p>

        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          {copy.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-xl border">
      {items.map((item) => {
        const Icon = activityIcons[item.type];

        const details = [
          item.metadata.contactName,
          item.metadata.employeeName,
          item.metadata.status,
        ].filter(
          (value): value is string =>
            Boolean(value),
        );

        return (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/30"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40",
                item.type === "TASK_COMPLETED" &&
                  "border-emerald-500/20 bg-emerald-500/10",
              )}
            >
              <Icon
                className={cn(
                  "size-4 text-muted-foreground",
                  item.type === "TASK_COMPLETED" &&
                    "text-emerald-600 dark:text-emerald-400",
                )}
              />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">
                  {copy.labels[item.type]}
                </p>

                <time
                  dateTime={item.occurredAt.toISOString()}
                  className="shrink-0 text-[11px] text-muted-foreground"
                >
                  {dateFormatter.format(
                    item.occurredAt,
                  )}
                </time>
              </div>

              <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {item.title}
                </span>

                {details.length > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>

                    <span className="truncate">
                      {details.join(" · ")}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock3,
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

const activityStyles: Record<
  DashboardActivityType,
  {
    icon: string;
    iconContainer: string;
    indicator: string;
  }
> = {
  CONTACT_CREATED: {
    icon:
      "text-blue-600 dark:text-blue-400",
    iconContainer:
      "border-blue-500/20 bg-blue-500/10",
    indicator:
      "bg-blue-500",
  },

  CONVERSATION_UPDATED: {
    icon:
      "text-violet-600 dark:text-violet-400",
    iconContainer:
      "border-violet-500/20 bg-violet-500/10",
    indicator:
      "bg-violet-500",
  },

  TASK_CREATED: {
    icon:
      "text-amber-600 dark:text-amber-400",
    iconContainer:
      "border-amber-500/20 bg-amber-500/10",
    indicator:
      "bg-amber-500",
  },

  TASK_COMPLETED: {
    icon:
      "text-emerald-600 dark:text-emerald-400",
    iconContainer:
      "border-emerald-500/20 bg-emerald-500/10",
    indicator:
      "bg-emerald-500",
  },

  MEETING_CREATED: {
    icon:
      "text-cyan-600 dark:text-cyan-400",
    iconContainer:
      "border-cyan-500/20 bg-cyan-500/10",
    indicator:
      "bg-cyan-500",
  },
};

export function RecentActivityFeed({
  items,
  locale,
}: RecentActivityFeedProps) {
  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        emptyTitle:
          "Активності поки немає",
        emptyDescription:
          "Нові контакти, розмови, завдання та зустрічі з’являтимуться тут.",
        openActivity:
          "Відкрити активність",
        labels: {
          CONTACT_CREATED:
            "Новий контакт",
          CONVERSATION_UPDATED:
            "Розмову оновлено",
          TASK_CREATED:
            "Нове завдання",
          TASK_COMPLETED:
            "Завдання виконано",
          MEETING_CREATED:
            "Створено зустріч",
        } satisfies Record<
          DashboardActivityType,
          string
        >,
      }
    : {
        emptyTitle:
          "No recent activity",
        emptyDescription:
          "New contacts, conversations, tasks and meetings will appear here.",
        openActivity:
          "Open activity",
        labels: {
          CONTACT_CREATED:
            "New contact",
          CONVERSATION_UPDATED:
            "Conversation updated",
          TASK_CREATED:
            "New task",
          TASK_COMPLETED:
            "Task completed",
          MEETING_CREATED:
            "Meeting created",
        } satisfies Record<
          DashboardActivityType,
          string
        >,
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

  if (items.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
          <Clock3 className="size-5 text-muted-foreground" />
        </span>

        <p className="mt-5 text-base font-semibold">
          {copy.emptyTitle}
        </p>

        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {copy.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      {items.map((item, index) => {
        const Icon =
          activityIcons[item.type];

        const styles =
          activityStyles[item.type];

        const details = [
          item.metadata.contactName,
          item.metadata.employeeName,
          item.metadata.status,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(value),
        );

        const isLast =
          index === items.length - 1;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-label={
              copy.openActivity
            }
            className={cn(
              "group relative block min-w-0 px-4 py-4 outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25 sm:px-5",
              !isLast &&
                "border-b",
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative shrink-0">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl border",
                    styles.iconContainer,
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      styles.icon,
                    )}
                  />
                </span>

                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-10 h-[calc(100%+1rem)] w-px -translate-x-1/2 bg-border"
                  />
                ) : null}

                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
                    styles.indicator,
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {
                        copy.labels[
                          item.type
                        ]
                      }
                    </p>

                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                      {item.title}
                    </p>
                  </div>

                  <time
                    dateTime={item.occurredAt.toISOString()}
                    className="shrink-0 text-[11px] text-muted-foreground"
                  >
                    {dateFormatter.format(
                      item.occurredAt,
                    )}
                  </time>
                </div>

                {details.length > 0 ? (
                  <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5">
                    {details.map(
                      (detail) => (
                        <span
                          key={detail}
                          className="max-w-full truncate rounded-full border bg-muted/20 px-2.5 py-1 text-[10px] text-muted-foreground"
                        >
                          {detail}
                        </span>
                      ),
                    )}
                  </div>
                ) : null}
              </div>

              <ArrowRight className="mt-1 hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

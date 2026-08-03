export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Eye,
  Globe2,
  Link2,
  MessageCircle,
  MessageSquare,
  MousePointerClick,
  Radio,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWidgetAnalytics } from "@/features/analytics/repositories/widget-analytics.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type WidgetAnalyticsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const eventIconMap = {
  VIEW: Eye,
  OPEN: MousePointerClick,
  CONVERSATION_STARTED: MessageCircle,
  USER_MESSAGE: MessageSquare,
  LEAD_CREATED: UserPlus,
  AI_RESPONSE: Bot,
} as const;

export default async function WidgetAnalyticsPage({
  params,
}: WidgetAnalyticsPageProps) {
  const { locale } = await params;

  const workspace = await getCurrentWorkspace();

  const analytics = await getWidgetAnalytics({
    workspaceId: workspace.id,
    periodDays: 30,
  });

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        back: "Загальна аналітика",
        eyebrow: "Website Widget",
        title: "Аналітика віджета",
        description:
          "Перегляди, відкриття, розмови та конверсія Website Widget за останні 30 днів.",
        period: "Останні 30 днів",

        visitors: "Унікальні відвідувачі",
        views: "Перегляди",
        opens: "Відкриття",
        conversations: "Нові розмови",
        aiResponses: "Відповіді AI",
        contacts: "Створені контакти",

        openRate: "Конверсія у відкриття",
        conversationRate: "Конверсія у розмову",
        aiResponseRate: "AI Response Rate",
        averageMessages: "Середньо повідомлень",
        activeChannels: "Активні канали",

        funnelTitle: "Конверсійна воронка",
        funnelDescription:
          "Шлях від завантаження віджета до створення ліда.",
        funnelLabels: {
          views: "Перегляди",
          opens: "Відкриття",
          conversations: "Початок розмови",
          leads: "Ліди",
        },

        topPagesTitle: "Найкращі сторінки",
        topPagesDescription:
          "Сторінки сайту з найбільшою кількістю переглядів віджета.",
        noPages: "Даних про сторінки поки немає.",
        pageViews: "переглядів",
        pageOpens: "відкриттів",
        pageChats: "розмов",
        openRateShort: "Open rate",

        referrersTitle: "Джерела трафіку",
        referrersDescription:
          "Звідки приходять відвідувачі Website Widget.",
        noReferrers:
          "Даних про джерела трафіку поки немає.",

        recentTitle: "Останні події",
        recentDescription:
          "Найновіша активність Website Widget.",
        noEvents: "Подій віджета поки немає.",
        unknownChannel: "Website Widget",
        unknownPage: "Невідома сторінка",

        eventLabels: {
          VIEW: "Віджет переглянуто",
          OPEN: "Віджет відкрито",
          CONVERSATION_STARTED:
            "Розпочато нову розмову",
          USER_MESSAGE:
            "Користувач надіслав повідомлення",
          LEAD_CREATED: "Створено ліда",
          AI_RESPONSE: "AI надіслав відповідь",
        },
      }
    : {
        back: "Workspace analytics",
        eyebrow: "Website Widget",
        title: "Widget Analytics",
        description:
          "Views, opens, conversations and Website Widget conversion over the last 30 days.",
        period: "Last 30 days",

        visitors: "Unique visitors",
        views: "Views",
        opens: "Opens",
        conversations: "New conversations",
        aiResponses: "AI responses",
        contacts: "Contacts created",

        openRate: "Open conversion",
        conversationRate: "Conversation conversion",
        aiResponseRate: "AI response rate",
        averageMessages: "Average messages",
        activeChannels: "Active channels",

        funnelTitle: "Conversion funnel",
        funnelDescription:
          "The journey from loading the widget to creating a lead.",
        funnelLabels: {
          views: "Views",
          opens: "Opens",
          conversations: "Conversations",
          leads: "Leads",
        },

        topPagesTitle: "Top pages",
        topPagesDescription:
          "Website pages with the highest widget activity.",
        noPages: "No page analytics yet.",
        pageViews: "views",
        pageOpens: "opens",
        pageChats: "conversations",
        openRateShort: "Open rate",

        referrersTitle: "Traffic sources",
        referrersDescription:
          "Where Website Widget visitors come from.",
        noReferrers: "No traffic-source data yet.",

        recentTitle: "Recent events",
        recentDescription:
          "The latest Website Widget activity.",
        noEvents: "No widget events yet.",
        unknownChannel: "Website Widget",
        unknownPage: "Unknown page",

        eventLabels: {
          VIEW: "Widget viewed",
          OPEN: "Widget opened",
          CONVERSATION_STARTED:
            "New conversation started",
          USER_MESSAGE: "User message sent",
          LEAD_CREATED: "Lead created",
          AI_RESPONSE: "AI response generated",
        },
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const overviewCards = [
    {
      key: "visitors",
      label: copy.visitors,
      value: analytics.overview.uniqueVisitors,
      description: `${analytics.overview.views} ${copy.pageViews}`,
      icon: Users,
    },
    {
      key: "opens",
      label: copy.opens,
      value: analytics.overview.opens,
      description: `${analytics.overview.openRate}% ${copy.openRateShort}`,
      icon: MousePointerClick,
    },
    {
      key: "conversations",
      label: copy.conversations,
      value: analytics.overview.conversations,
      description: `${analytics.overview.conversationRate}%`,
      icon: MessageCircle,
    },
    {
      key: "responses",
      label: copy.aiResponses,
      value: analytics.overview.aiResponses,
      description: `${analytics.overview.aiResponseRate}%`,
      icon: Bot,
    },
    {
      key: "contacts",
      label: copy.contacts,
      value: analytics.overview.contactsCreated,
      description: `${analytics.overview.leads} leads`,
      icon: UserPlus,
    },
  ];

  const secondaryMetrics = [
    {
      label: copy.openRate,
      value: `${analytics.overview.openRate}%`,
    },
    {
      label: copy.conversationRate,
      value: `${analytics.overview.conversationRate}%`,
    },
    {
      label: copy.aiResponseRate,
      value: `${analytics.overview.aiResponseRate}%`,
    },
    {
      label: copy.averageMessages,
      value: analytics.overview.averageMessagesPerConversation,
    },
    {
      label: copy.activeChannels,
      value: analytics.overview.activeWebsiteChannels,
    },
  ];

  const maxFunnelValue = Math.max(
    1,
    ...analytics.funnel.map((item) => item.value),
  );

  const maxPageViews = Math.max(
    1,
    ...analytics.topPages.map((page) => page.views),
  );

  const maxReferrerViews = Math.max(
    1,
    ...analytics.topReferrers.map(
      (referrer) => referrer.views,
    ),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={`/${locale}/dashboard/analytics`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {copy.back}
          </Link>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {copy.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {copy.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit px-3 py-1.5"
        >
          {copy.period}
        </Badge>
      </header>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid sm:grid-cols-2 xl:grid-cols-5">
          {overviewCards.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.key}
                className={cn(
                  "flex min-h-28 items-center gap-3 px-4 py-4",
                  index > 0 &&
                    "border-t sm:border-l sm:border-t-0",
                  index === 2 &&
                    "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0",
                  index === 4 &&
                    "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <Icon className="size-4 text-muted-foreground" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">
                    {metric.label}
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                    {metric.value}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {secondaryMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border bg-card px-4 py-3"
          >
            <p className="text-xs leading-5 text-muted-foreground">
              {metric.label}
            </p>

            <p className="mt-1 text-lg font-semibold tabular-nums">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{copy.funnelTitle}</CardTitle>

            <CardDescription>
              {copy.funnelDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {analytics.funnel.map((item, index) => {
              const width =
                item.value > 0
                  ? Math.max(
                      3,
                      Math.round(
                        (item.value / maxFunnelValue) *
                          100,
                      ),
                    )
                  : 0;

              const previous =
                index > 0
                  ? analytics.funnel[index - 1]
                  : null;

              const conversion =
                previous && previous.value > 0
                  ? Math.round(
                      (item.value /
                        previous.value) *
                        100,
                    )
                  : null;

              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {
                          copy.funnelLabels[
                            item.key
                          ]
                        }
                      </p>

                      {conversion !== null ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {conversion}% conversion
                        </p>
                      ) : null}
                    </div>

                    <span className="text-xl font-semibold tabular-nums">
                      {item.value}
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.referrersTitle}</CardTitle>

            <CardDescription>
              {copy.referrersDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.topReferrers.length === 0 ? (
              <EmptyState
                icon={Link2}
                text={copy.noReferrers}
              />
            ) : (
              <div className="space-y-4">
                {analytics.topReferrers.map(
                  (referrer) => {
                    const width = Math.max(
                      4,
                      Math.round(
                        (referrer.views /
                          maxReferrerViews) *
                          100,
                      ),
                    );

                    return (
                      <div key={referrer.label}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                              <Link2 className="size-3.5 text-muted-foreground" />
                            </span>

                            <p className="truncate text-sm font-medium">
                              {referrer.label}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {referrer.views}
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{copy.topPagesTitle}</CardTitle>

            <CardDescription>
              {copy.topPagesDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.topPages.length === 0 ? (
              <EmptyState
                icon={Globe2}
                text={copy.noPages}
              />
            ) : (
              <div className="divide-y rounded-xl border">
                {analytics.topPages.map((page) => {
                  const width = Math.max(
                    4,
                    Math.round(
                      (page.views /
                        maxPageViews) *
                        100,
                    ),
                  );

                  return (
                    <div
                      key={page.pageUrl}
                      className="px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {page.label}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {page.views} {copy.pageViews}
                            {" · "}
                            {page.opens} {copy.pageOpens}
                            {" · "}
                            {page.conversations}{" "}
                            {copy.pageChats}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0"
                        >
                          {page.openRate}%
                        </Badge>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.recentTitle}</CardTitle>

            <CardDescription>
              {copy.recentDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.recentEvents.length === 0 ? (
              <EmptyState
                icon={Radio}
                text={copy.noEvents}
              />
            ) : (
              <div className="divide-y rounded-xl border">
                {analytics.recentEvents
                  .slice(0, 10)
                  .map((event) => {
                    const Icon =
                      eventIconMap[event.type];

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                          <Icon className="size-4 text-muted-foreground" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm font-medium">
                              {
                                copy.eventLabels[
                                  event.type
                                ]
                              }
                            </p>

                            <time
                              dateTime={event.createdAt.toISOString()}
                              className="shrink-0 text-[11px] text-muted-foreground"
                            >
                              {dateFormatter.format(
                                event.createdAt,
                              )}
                            </time>
                          </div>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {event.channel?.name ||
                              copy.unknownChannel}
                            {event.channel?.employee
                              ?.name
                              ? ` · ${event.channel.employee.name}`
                              : ""}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-muted-foreground">
                            {event.pageUrl ||
                              copy.unknownPage}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end">
        <Link
          href={`/${locale}/dashboard/analytics`}
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
            "gap-2",
          )}
        >
          {copy.back}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

type EmptyStateProps = {
  icon: typeof Globe2;
  text: string;
};

function EmptyState({
  icon: Icon,
  text,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">
        <Icon className="size-4 text-muted-foreground" />
      </span>

      <p className="mt-3 text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

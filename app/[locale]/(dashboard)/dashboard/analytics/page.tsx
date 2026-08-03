export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Globe2,
  MessageSquare,
  Radio,
  UserRound,
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
import { ConversationsChart } from "@/features/analytics/components/conversations-chart";
import { WorkspaceAnalyticsCards } from "@/features/analytics/components/workspace-analytics-cards";
import { getWorkspaceAnalytics } from "@/features/analytics/repositories/workspace-analytics.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type WorkspaceAnalyticsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function WorkspaceAnalyticsPage({
  params,
}: WorkspaceAnalyticsPageProps) {
  const { locale } = await params;

  const workspace = await getCurrentWorkspace();

  const analytics = await getWorkspaceAnalytics(
    workspace.id,
  );

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Аналітика робочого простору",
        title: "Analytics",
        description:
          "Відстежуйте розмови, лідів, канали та ефективність AI-співробітників.",
        period: "Останні 30 днів",
        widgetAnalytics: "Аналітика віджета",

        performanceTitle:
          "Ефективність AI-співробітників",
        performanceDescription:
          "Порівняння активності та результатів кожного AI-співробітника.",
        noEmployees:
          "AI-співробітників поки немає.",
        conversations: "Розмови",
        messages: "Повідомлення",
        closed: "Закрито",
        qualified: "Кваліфіковані ліди",
        averageLeadScore: "Середній Lead Score",
        openEmployee: "Відкрити",

        channelsTitle: "Розподіл за каналами",
        channelsDescription:
          "Кількість розмов, створених через кожен канал.",
        noChannels:
          "Канали з розмовами поки відсутні.",
        channelConversations: "розмов",

        conversionTitle: "Воронка результатів",
        conversionDescription:
          "Основні етапи перетворення контактів на клієнтів.",
        allContacts: "Усі контакти",
        qualifiedLeads: "Кваліфіковані",
        customers: "Клієнти",
        leadConversion: "Конверсія лідів",
        closeRate: "Закриття розмов",

        workspaceTitle: "Ресурси робочого простору",
        workspaceDescription:
          "Загальна інфраструктура Sellora у цьому workspace.",
        totalEmployees: "Усього AI-співробітників",
        activeEmployees: "Активні AI-співробітники",
        knowledgeSources: "Джерела знань",
        websiteChannels: "Активні Website-канали",

        recentTitle: "Останні розмови",
        recentDescription:
          "Найновіші діалоги з усіх AI-співробітників і каналів.",
        noRecentConversations:
          "Розмов поки немає.",
        anonymous: "Анонімний відвідувач",
        noMessage: "Повідомлень поки немає.",
        viewInbox: "Відкрити Inbox",
        messageCount: "повідомлень",

        status: {
          DRAFT: "Чернетка",
          ACTIVE: "Активний",
          PAUSED: "Призупинений",
          ARCHIVED: "Архівний",
        },
      }
    : {
        eyebrow: "Workspace analytics",
        title: "Analytics",
        description:
          "Track conversations, leads, channels and AI employee performance.",
        period: "Last 30 days",
        widgetAnalytics: "Widget Analytics",

        performanceTitle: "AI employee performance",
        performanceDescription:
          "Compare activity and outcomes across AI employees.",
        noEmployees: "No AI employees yet.",
        conversations: "Conversations",
        messages: "Messages",
        closed: "Closed",
        qualified: "Qualified leads",
        averageLeadScore: "Average lead score",
        openEmployee: "Open",

        channelsTitle: "Channel breakdown",
        channelsDescription:
          "Conversations created through each connected channel.",
        noChannels:
          "No channels with conversations yet.",
        channelConversations: "conversations",

        conversionTitle: "Outcome funnel",
        conversionDescription:
          "Core stages from workspace contacts to customers.",
        allContacts: "All contacts",
        qualifiedLeads: "Qualified",
        customers: "Customers",
        leadConversion: "Lead conversion",
        closeRate: "Conversation close rate",

        workspaceTitle: "Workspace resources",
        workspaceDescription:
          "The current Sellora infrastructure in this workspace.",
        totalEmployees: "Total AI employees",
        activeEmployees: "Active AI employees",
        knowledgeSources: "Knowledge sources",
        websiteChannels: "Active website channels",

        recentTitle: "Recent conversations",
        recentDescription:
          "The latest conversations across all AI employees and channels.",
        noRecentConversations:
          "No conversations yet.",
        anonymous: "Anonymous visitor",
        noMessage: "No messages yet.",
        viewInbox: "Open Inbox",
        messageCount: "messages",

        status: {
          DRAFT: "Draft",
          ACTIVE: "Active",
          PAUSED: "Paused",
          ARCHIVED: "Archived",
        },
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const maxChannelConversations = Math.max(
    1,
    ...analytics.channelBreakdown.map(
      (channel) => channel.conversations,
    ),
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {copy.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {copy.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="w-fit px-3 py-1.5"
          >
            {copy.period}
          </Badge>

          <Link
            href={`/${locale}/dashboard/analytics/widget`}
            className={cn(
              buttonVariants({
                variant: "outline",
              }),
              "gap-2",
            )}
          >
            <Globe2 className="size-4" />
            {copy.widgetAnalytics}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <WorkspaceAnalyticsCards
        locale={locale}
        conversationsLast30Days={
          analytics.overview.conversationsLast30Days
        }
        openConversations={
          analytics.overview.openConversations
        }
        messagesLast30Days={
          analytics.overview.messagesLast30Days
        }
        qualifiedLeads={
          analytics.overview.qualifiedLeads
        }
        averageLeadScore={
          analytics.overview.averageLeadScore
        }
        activeEmployees={
          analytics.overview.activeEmployees
        }
      />

      <ConversationsChart
        locale={locale}
        data={analytics.dailyConversations}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card>
          <CardHeader>
            <CardTitle>
              {copy.performanceTitle}
            </CardTitle>

            <CardDescription>
              {copy.performanceDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.employeePerformance.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {copy.noEmployees}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.employeePerformance.map(
                  (employee) => (
                    <div
                      key={employee.id}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                            <Bot className="size-5 text-muted-foreground" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium">
                                {employee.name}
                              </p>

                              <Badge variant="outline">
                                {
                                  copy.status[
                                    employee.status
                                  ]
                                }
                              </Badge>
                            </div>

                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {employee.role}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/${locale}/dashboard/employees/${employee.id}/analytics`}
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              size: "sm",
                            }),
                            "shrink-0 gap-2",
                          )}
                        >
                          {copy.openEmployee}
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <Metric
                          label={copy.conversations}
                          value={employee.conversations}
                        />

                        <Metric
                          label={copy.messages}
                          value={employee.messages}
                        />

                        <Metric
                          label={copy.closed}
                          value={
                            employee.closedConversations
                          }
                        />

                        <Metric
                          label={copy.qualified}
                          value={employee.qualifiedLeads}
                        />

                        <Metric
                          label={copy.averageLeadScore}
                          value={
                            employee.averageLeadScore !== null
                              ? `${employee.averageLeadScore}/100`
                              : "—"
                          }
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.channelsTitle}</CardTitle>

            <CardDescription>
              {copy.channelsDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics.channelBreakdown.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {copy.noChannels}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {analytics.channelBreakdown.map(
                  (channel) => {
                    const width = Math.max(
                      4,
                      Math.round(
                        (channel.conversations /
                          maxChannelConversations) *
                          100,
                      ),
                    );

                    return (
                      <div key={channel.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                              <Radio className="size-4 text-muted-foreground" />
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {channel.name}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {channel.type}
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {channel.conversations}
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {channel.conversations}{" "}
                          {copy.channelConversations}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {copy.conversionTitle}
            </CardTitle>

            <CardDescription>
              {copy.conversionDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FunnelRow
              icon={Users}
              label={copy.allContacts}
              value={analytics.overview.contacts}
            />

            <FunnelRow
              icon={CheckCircle2}
              label={copy.qualifiedLeads}
              value={analytics.overview.qualifiedLeads}
            />

            <FunnelRow
              icon={UserRound}
              label={copy.customers}
              value={analytics.overview.customers}
            />

            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
              <Metric
                label={copy.leadConversion}
                value={`${analytics.overview.leadConversionRate}%`}
              />

              <Metric
                label={copy.closeRate}
                value={`${analytics.overview.conversationCloseRate}%`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {copy.workspaceTitle}
            </CardTitle>

            <CardDescription>
              {copy.workspaceDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ResourceCard
              icon={Bot}
              label={copy.totalEmployees}
              value={analytics.overview.aiEmployees}
            />

            <ResourceCard
              icon={CheckCircle2}
              label={copy.activeEmployees}
              value={analytics.overview.activeEmployees}
            />

            <ResourceCard
              icon={BookOpen}
              label={copy.knowledgeSources}
              value={analytics.overview.knowledgeSources}
            />

            <ResourceCard
              icon={Globe2}
              label={copy.websiteChannels}
              value={analytics.overview.websiteChannels}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{copy.recentTitle}</CardTitle>

              <CardDescription className="mt-2">
                {copy.recentDescription}
              </CardDescription>
            </div>

            <Link
              href={`/${locale}/dashboard/conversations`}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                }),
                "gap-2",
              )}
            >
              {copy.viewInbox}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {analytics.recentConversations.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed px-6 text-center">
              <p className="text-sm text-muted-foreground">
                {copy.noRecentConversations}
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {analytics.recentConversations.map(
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
                      href={`/${locale}/dashboard/conversations?conversationId=${conversation.id}`}
                      className="group grid gap-4 p-4 transition-colors hover:bg-muted/30 lg:grid-cols-[220px_minmax(0,1fr)_140px_140px_24px] lg:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                          <UserRound className="size-4 text-muted-foreground" />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {contactName}
                          </p>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {conversation.employee.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <MessageSquare className="size-4 shrink-0 text-muted-foreground" />

                        <p className="truncate text-sm text-muted-foreground">
                          {latestMessage?.content ||
                            copy.noMessage}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {conversation.status}
                        </Badge>

                        {conversation.channel ? (
                          <Badge variant="secondary">
                            {conversation.channel.type}
                          </Badge>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          {conversation._count.messages}{" "}
                          {copy.messageCount}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {dateFormatter.format(activityDate)}
                        </p>
                      </div>

                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string | number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="text-xs leading-5 text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

type FunnelRowProps = {
  icon: typeof Users;
  label: string;
  value: number;
};

function FunnelRow({
  icon: Icon,
  label,
  value,
}: FunnelRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>

        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      </div>

      <span className="text-lg font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

type ResourceCardProps = {
  icon: typeof Bot;
  label: string;
  value: number;
};

function ResourceCard({
  icon: Icon,
  label,
  value,
}: ResourceCardProps) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-5 text-muted-foreground">
          {label}
        </p>

        <Icon className="size-4 shrink-0 text-muted-foreground" />
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

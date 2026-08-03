import Link from "next/link";
import {
  BookOpen,
  Bot,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AIEmployeesWidget } from "@/features/dashboard/components/ai-employees-widget";
import { RecentActivityFeed } from "@/features/dashboard/components/recent-activity-feed";
import { RecentConversationsWidget } from "@/features/dashboard/components/recent-conversations-widget";
import { UpcomingMeetingsWidget } from "@/features/dashboard/components/upcoming-meetings-widget";
import { getDashboardData } from "@/features/dashboard/services/dashboard.service";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type DashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { locale } = await params;

  const t = await getTranslations("dashboard");

  const workspace = await getCurrentWorkspace();

  const dashboard = await getDashboardData({
    workspaceId: workspace.id,
    locale,
  });

  const createEmployeeHref =
    `/${locale}/dashboard/employees/new`;

  const metrics = [
    {
      key: "aiEmployees",
      title: t("metrics.aiEmployees.title"),
      value: dashboard.overview.aiEmployees,
      description: t(
        "metrics.aiEmployees.description",
        {
          active:
            dashboard.overview.activeEmployees,
        },
      ),
      icon: Bot,
    },
    {
      key: "conversations",
      title: t("metrics.conversations.title"),
      value: dashboard.overview.conversations,
      description: t(
        "metrics.conversations.description",
      ),
      icon: MessageSquare,
    },
    {
      key: "resolutionRate",
      title: t("metrics.resolutionRate.title"),
      value:
        dashboard.overview.conversations > 0
          ? `${dashboard.overview.conversationCloseRate}%`
          : "—",
      description: t(
        "metrics.resolutionRate.description",
      ),
      icon: Sparkles,
    },
    {
      key: "knowledgeSources",
      title: t(
        "metrics.knowledgeSources.title",
      ),
      value:
        dashboard.overview.knowledgeSources,
      description: t(
        "metrics.knowledgeSources.description",
      ),
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <WorkspaceHeader
          title={t("welcome")}
          description={t("description")}
        />

        <Button
          className="shrink-0"
          nativeButton={false}
          render={
            <Link href={createEmployeeHref} />
          }
        >
          <Plus className="size-4" />
          {t("createEmployee")}
        </Button>
      </header>

      <section
        aria-label={t("metricsLabel")}
        className="overflow-hidden rounded-xl border bg-card"
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.key}
                className={[
                  "flex min-h-20 items-center gap-3 px-4 py-3",
                  index > 0
                    ? "border-t sm:border-t-0 sm:border-l"
                    : "",
                  index === 2
                    ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0"
                    : "",
                ].join(" ")}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {metric.title}
                    </p>

                    <p className="shrink-0 text-xl font-semibold tracking-tight tabular-nums">
                      {metric.value}
                    </p>
                  </div>

                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-2">
        <AIEmployeesWidget
          employees={
            dashboard.employeePerformance
          }
          locale={locale}
        />

        <Card className="h-full">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold">
                {t("activity.title")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("activity.description")}
              </p>
            </div>

            <RecentActivityFeed
              items={dashboard.recentActivity.slice(
                0,
                5,
              )}
              locale={locale}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-2">
        <RecentConversationsWidget
          conversations={
            dashboard.recentConversations.slice(
              0,
              4,
            )
          }
          locale={locale}
        />

        <UpcomingMeetingsWidget
          meetings={
            dashboard.upcomingMeetings.slice(0, 4)
          }
          locale={locale}
        />
      </section>
    </div>
  );
}

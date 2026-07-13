import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  MessageSquare,
  Plus,
  Radio,
  Sparkles,
  Workflow,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAIEmployees } from "@/features/ai-employees/queries";
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

  const employees = await getAIEmployees({
    workspaceId: workspace.id,
  });

  const activeEmployees = employees.filter(
    (employee) => employee.status === "ACTIVE",
  ).length;

  const recentEmployees = employees.slice(0, 3);

  const employeesHref = `/${locale}/dashboard/employees`;
  const createEmployeeHref = `/${locale}/dashboard/employees/new`;

  const metrics = [
    {
      key: "aiEmployees",
      title: t("metrics.aiEmployees.title"),
      value: employees.length.toString(),
      description: t("metrics.aiEmployees.description", {
        active: activeEmployees,
      }),
      icon: Bot,
    },
    {
      key: "conversations",
      title: t("metrics.conversations.title"),
      value: "0",
      description: t("metrics.conversations.description"),
      icon: MessageSquare,
    },
    {
      key: "resolutionRate",
      title: t("metrics.resolutionRate.title"),
      value: "—",
      description: t("metrics.resolutionRate.description"),
      icon: Sparkles,
    },
    {
      key: "knowledgeSources",
      title: t("metrics.knowledgeSources.title"),
      value: "0",
      description: t("metrics.knowledgeSources.description"),
      icon: BookOpen,
    },
  ];

  const quickActions = [
    {
      key: "employee",
      title: t("quickActions.createEmployee.title"),
      description: t("quickActions.createEmployee.description"),
      href: createEmployeeHref,
      icon: Plus,
    },
    {
      key: "knowledge",
      title: t("quickActions.addKnowledge.title"),
      description: t("quickActions.addKnowledge.description"),
      href: `/${locale}/dashboard/knowledge`,
      icon: BookOpen,
    },
    {
      key: "channel",
      title: t("quickActions.connectChannel.title"),
      description: t("quickActions.connectChannel.description"),
      href: `/${locale}/dashboard/channels`,
      icon: Radio,
    },
    {
      key: "automation",
      title: t("quickActions.createAutomation.title"),
      description: t("quickActions.createAutomation.description"),
      href: `/${locale}/dashboard/automations`,
      icon: Workflow,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("overview")}
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {t("welcome")}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href={createEmployeeHref} />}
        >
          <Plus className="size-4" />
          {t("createEmployee")}
        </Button>
      </section>

      <section
        aria-label={t("metricsLabel")}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>

                <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {metric.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>{t("employees.title")}</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("employees.description")}
              </p>
            </div>

            <Link
              href={employeesHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("employees.viewAll")}
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>

          <CardContent>
            {recentEmployees.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
                <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/40">
                  <Bot className="size-5 text-muted-foreground" />
                </span>

                <h3 className="mt-4 font-semibold">
                  {t("employees.emptyTitle")}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {t("employees.emptyDescription")}
                </p>

                <Button
                  className="mt-5"
                  nativeButton={false}
                  render={<Link href={createEmployeeHref} />}
                >
                  <Plus className="size-4" />
                  {t("createEmployee")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEmployees.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/${locale}/dashboard/employees/${employee.id}`}
                    className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                      <Bot className="size-4 text-muted-foreground" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {employee.name}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {employee.role}
                      </p>
                    </div>

                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {employee.status}
                    </span>

                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions.title")}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("quickActions.description")}
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.key}
                  href={action.href}
                  className="group flex items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {action.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("activity.title")}</CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("activity.description")}
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
            <MessageSquare className="size-5 text-muted-foreground" />

            <p className="mt-4 text-sm font-medium">
              {t("activity.emptyTitle")}
            </p>

            <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
              {t("activity.emptyDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
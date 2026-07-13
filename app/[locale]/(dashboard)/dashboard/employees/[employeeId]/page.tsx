import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bot,
  MessageSquare,
  Radio,
  Settings,
  SlidersHorizontal,
  TestTube2,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type AIEmployeePageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

const tabs = [
  {
    key: "overview",
    segment: "",
    icon: Activity,
  },
  {
    key: "instructions",
    segment: "instructions",
    icon: SlidersHorizontal,
  },
  {
    key: "knowledge",
    segment: "knowledge",
    icon: BookOpen,
  },
  {
    key: "channels",
    segment: "channels",
    icon: Radio,
  },
  {
    key: "tools",
    segment: "tools",
    icon: Wrench,
  },
  {
    key: "testChat",
    segment: "test-chat",
    icon: TestTube2,
  },
  {
    key: "conversations",
    segment: "conversations",
    icon: MessageSquare,
  },
  {
    key: "analytics",
    segment: "analytics",
    icon: BarChart3,
  },
  {
    key: "settings",
    segment: "settings",
    icon: Settings,
  },
] as const;

export default async function AIEmployeePage({
  params,
}: AIEmployeePageProps) {
  const { locale, employeeId } = await params;

  const t = await getTranslations("aiEmployeeDetails");
  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const employeeBaseHref =
    `/${locale}/dashboard/employees/${employee.id}`;

  return (
    <div className="space-y-8">
      <section>
        <Link
          href={`/${locale}/dashboard/employees`}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-tight">
                  {employee.name}
                </h1>

                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
                    employee.status === "ACTIVE" &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                    employee.status === "DRAFT" &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-400",
                    employee.status === "PAUSED" &&
                      "border-orange-500/30 bg-orange-500/10 text-orange-400",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {t(`statuses.${employee.status.toLowerCase()}`)}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {employee.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label={t("navigationLabel")}
        className="overflow-x-auto border-b"
      >
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === "overview";

            const href = tab.segment
              ? `${employeeBaseHref}/${tab.segment}`
              : employeeBaseHref;

            return (
              <Link
                key={tab.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center gap-2 px-3 text-sm font-medium text-muted-foreground transition-colors",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  isActive && "text-foreground",
                )}
              >
                <Icon className="size-4" />
                {t(`tabs.${tab.key}`)}

                {isActive ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("overview.title")}</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {employee.description || t("overview.noDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("configuration.title")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                {t("configuration.language")}
              </span>

              <span className="font-medium">
                {employee.language}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                {t("configuration.tone")}
              </span>

              <span className="font-medium capitalize">
                {employee.tone || t("configuration.notSet")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                {t("configuration.created")}
              </span>

              <time
                dateTime={employee.createdAt.toISOString()}
                className="font-medium"
              >
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(employee.createdAt)}
              </time>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                {t("configuration.updated")}
              </span>

              <time
                dateTime={employee.updatedAt.toISOString()}
                className="font-medium"
              >
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(employee.updatedAt)}
              </time>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
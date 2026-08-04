import Link from "next/link";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  MessagesSquare,
  Plus,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AIEmployeeStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type DashboardEmployee = {
  id: string;
  name: string;
  role: string;
  status: AIEmployeeStatus;
  conversations: number;
  messages: number;
  closedConversations: number;
  qualifiedLeads: number;
  averageLeadScore: number | null;
};

type AIEmployeesWidgetProps = {
  employees: DashboardEmployee[];
  locale: string;
};

const statusClassNames: Record<
  AIEmployeeStatus,
  string
> = {
  DRAFT:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  ACTIVE:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PAUSED:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ARCHIVED:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const statusIndicatorClassNames: Record<
  AIEmployeeStatus,
  string
> = {
  DRAFT: "bg-zinc-500",
  ACTIVE: "bg-emerald-500",
  PAUSED: "bg-amber-500",
  ARCHIVED: "bg-slate-500",
};

export function AIEmployeesWidget({
  employees,
  locale,
}: AIEmployeesWidgetProps) {
  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        title:
          "ШІ-співробітники",
        description:
          "Активність і результати вашої ШІ-команди.",
        viewAll:
          "Переглянути всіх",
        emptyTitle:
          "ШІ-співробітників поки немає",
        emptyDescription:
          "Створіть першого ШІ-співробітника й налаштуйте його для роботи з клієнтами.",
        createEmployee:
          "Створити співробітника",
        conversations:
          "Розмови",
        messages:
          "Повідомлення",
        qualified:
          "Кваліфіковані ліди",
        leadScore:
          "Lead Score",
        resolution:
          "Закрито",
        performance:
          "Ефективність",
        openEmployee:
          "Відкрити ШІ-співробітника",
        statuses: {
          DRAFT:
            "Чернетка",
          ACTIVE:
            "Активний",
          PAUSED:
            "Пауза",
          ARCHIVED:
            "Архів",
        } satisfies Record<
          AIEmployeeStatus,
          string
        >,
      }
    : {
        title:
          "AI Employees",
        description:
          "Activity and results across your AI team.",
        viewAll:
          "View all",
        emptyTitle:
          "No AI Employees yet",
        emptyDescription:
          "Create your first AI Employee and configure it to work with customers.",
        createEmployee:
          "Create AI Employee",
        conversations:
          "Conversations",
        messages:
          "Messages",
        qualified:
          "Qualified leads",
        leadScore:
          "Lead score",
        resolution:
          "Resolved",
        performance:
          "Performance",
        openEmployee:
          "Open AI Employee",
        statuses: {
          DRAFT:
            "Draft",
          ACTIVE:
            "Active",
          PAUSED:
            "Paused",
          ARCHIVED:
            "Archived",
        } satisfies Record<
          AIEmployeeStatus,
          string
        >,
      };

  const employeesPath =
    `/${locale}/dashboard/employees`;

  const visibleEmployees =
    employees.slice(0, 4);

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "ACTIVE",
    ).length;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                {copy.title}
              </CardTitle>

              {employees.length > 0 ? (
                <Badge
                  variant="outline"
                  className="gap-1.5 text-[10px]"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" />

                  {activeEmployees}/
                  {employees.length}
                </Badge>
              ) : null}
            </div>

            <CardDescription className="mt-1">
              {copy.description}
            </CardDescription>
          </div>

          <Link
            href={employeesPath}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "h-8 w-full shrink-0 justify-center gap-1.5 px-2 text-xs sm:w-auto",
            )}
          >
            {copy.viewAll}

            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {visibleEmployees.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <h3 className="mt-5 text-base font-semibold">
              {copy.emptyTitle}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {copy.emptyDescription}
            </p>

            <Link
              href={`${employeesPath}/new`}
              className={cn(
                buttonVariants(),
                "mt-6 gap-2",
              )}
            >
              <Plus className="size-4" />

              {copy.createEmployee}
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {visibleEmployees.map(
              (employee) => {
                const resolutionRate =
                  employee.conversations > 0
                    ? Math.round(
                        (employee.closedConversations /
                          employee.conversations) *
                          100,
                      )
                    : 0;

                const employeeHref =
                  `${employeesPath}/${employee.id}`;

                return (
                  <Link
                    key={employee.id}
                    href={employeeHref}
                    aria-label={
                      copy.openEmployee
                    }
                    className="group block min-w-0 px-4 py-4 outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25 sm:px-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <Bot className="size-4 text-muted-foreground" />

                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
                            statusIndicatorClassNames[
                              employee.status
                            ],
                          )}
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="max-w-full truncate text-sm font-semibold">
                                {employee.name}
                              </p>

                              <Badge
                                variant="outline"
                                className={cn(
                                  "h-5 shrink-0 px-1.5 text-[10px] font-medium",
                                  statusClassNames[
                                    employee.status
                                  ],
                                )}
                              >
                                {
                                  copy.statuses[
                                    employee
                                      .status
                                  ]
                                }
                              </Badge>
                            </div>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {employee.role}
                            </p>
                          </div>

                          <ArrowRight className="mt-0.5 hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
                        </div>

                        <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                          <EmployeeMetric
                            icon={
                              MessagesSquare
                            }
                            label={
                              copy.conversations
                            }
                            value={
                              employee.conversations
                            }
                          />

                          <EmployeeMetric
                            icon={
                              MessageSquare
                            }
                            label={
                              copy.messages
                            }
                            value={
                              employee.messages
                            }
                          />

                          <EmployeeMetric
                            icon={
                              UserCheck
                            }
                            label={
                              copy.qualified
                            }
                            value={
                              employee.qualifiedLeads
                            }
                          />

                          <EmployeeMetric
                            icon={
                              TrendingUp
                            }
                            label={
                              copy.resolution
                            }
                            value={
                              employee.conversations >
                              0
                                ? `${resolutionRate}%`
                                : "—"
                            }
                          />
                        </div>

                        <div className="mt-3 flex min-w-0 flex-col gap-2 rounded-lg border bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <Sparkles className="size-3.5 shrink-0 text-muted-foreground" />

                            <span className="truncate text-xs text-muted-foreground">
                              {copy.leadScore}
                            </span>
                          </div>

                          <span className="shrink-0 text-xs font-semibold tabular-nums">
                            {employee.averageLeadScore !==
                            null
                              ? `${employee.averageLeadScore}/100`
                              : "—"}
                          </span>
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

type EmployeeMetricProps = {
  icon: typeof Bot;
  label: string;
  value: string | number;
};

function EmployeeMetric({
  icon: Icon,
  label,
  value,
}: EmployeeMetricProps) {
  return (
    <div className="min-w-0 rounded-lg border bg-background/50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />

        <span className="truncate text-[10px] text-muted-foreground">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  MessagesSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export function AIEmployeesWidget({
  employees,
  locale,
}: AIEmployeesWidgetProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "AI-співробітники",
        description:
          "Активність і результати AI-команди.",
        viewAll: "Усі",
        emptyTitle:
          "AI-співробітників поки немає",
        emptyDescription:
          "Створіть першого AI-співробітника.",
        createEmployee: "Створити",
        conversations: "розмов",
        messages: "повідомлень",
        qualified: "кваліфікованих",
        leadScore: "Lead Score",
        statuses: {
          DRAFT: "Чернетка",
          ACTIVE: "Активний",
          PAUSED: "Пауза",
          ARCHIVED: "Архів",
        },
      }
    : {
        title: "AI Employees",
        description:
          "Activity and results across your AI team.",
        viewAll: "View all",
        emptyTitle: "No AI employees yet",
        emptyDescription:
          "Create your first AI employee.",
        createEmployee: "Create",
        conversations: "conversations",
        messages: "messages",
        qualified: "qualified",
        leadScore: "Lead score",
        statuses: {
          DRAFT: "Draft",
          ACTIVE: "Active",
          PAUSED: "Paused",
          ARCHIVED: "Archived",
        },
      };

  const employeesPath =
    `/${locale}/dashboard/employees`;

  const visibleEmployees = employees.slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{copy.title}</CardTitle>

            <CardDescription className="mt-1">
              {copy.description}
            </CardDescription>
          </div>

          <Link
            href={employeesPath}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {copy.viewAll}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {visibleEmployees.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-7 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">
              <Bot className="size-4 text-muted-foreground" />
            </span>

            <h3 className="mt-3 text-sm font-semibold">
              {copy.emptyTitle}
            </h3>

            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              {copy.emptyDescription}
            </p>

            <Link
              href={`${employeesPath}/new`}
              className="mt-4 inline-flex h-8 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Sparkles className="size-3.5" />
              {copy.createEmployee}
            </Link>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            {visibleEmployees.map((employee) => (
              <Link
                key={employee.id}
                href={`${employeesPath}/${employee.id}`}
                className="group flex items-start gap-3 px-3 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                  <Bot className="size-4 text-muted-foreground" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
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
                      {copy.statuses[employee.status]}
                    </Badge>
                  </div>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {employee.role}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MessagesSquare className="size-3" />
                      {employee.conversations}{" "}
                      {copy.conversations}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {employee.messages}{" "}
                      {copy.messages}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="size-3" />
                      {employee.qualifiedLeads}{" "}
                      {copy.qualified}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="size-3" />
                      {copy.leadScore}:{" "}
                      {employee.averageLeadScore !== null
                        ? `${employee.averageLeadScore}/100`
                        : "—"}
                    </span>
                  </div>
                </div>

                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

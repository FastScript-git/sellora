import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CirclePause,
  FilePenLine,
  GitBranch,
  History,
  Play,
  Plus,
  Workflow,
  Zap,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/shared/empty-state";
import {
  PageHeader,
  PageHeaderStat,
} from "@/components/dashboard/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getWorkflowsByWorkspace } from "@/features/workflows/repositories/workflow.repository";
import type {
  WorkflowActionType,
  WorkflowStatus,
  WorkflowTriggerType,
} from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type WorkflowsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const statusClassNames: Record<WorkflowStatus, string> = {
  DRAFT:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  ACTIVE:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PAUSED:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ARCHIVED:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export default async function WorkflowsPage({
  params,
}: WorkflowsPageProps) {
  const { locale } = await params;
  const workspace = await getCurrentWorkspace();

  const workflows = await getWorkflowsByWorkspace({
    workspaceId: workspace.id,
  });

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Автоматизація",
        title: "Workflows",
        description:
          "Автоматизуйте роботу з лідами, контактами, завданнями та AI-співробітниками.",
        createWorkflow: "Створити workflow",
        total: "Усього",
        active: "Активні",
        paused: "Призупинені",
        draft: "Чернетки",
        archived: "Архівні",
        noWorkflows: "Workflow поки немає",
        noWorkflowsDescription:
          "Створіть перший workflow, щоб автоматизувати повторювані процеси продажів.",
        noDescription: "Опис не додано.",
        trigger: "Тригер",
        conditions: "Умови",
        actions: "Дії",
        executions: "Запуски",
        updated: "Оновлено",
        openWorkflow: "Відкрити workflow",
        noTrigger: "Тригер не налаштовано",
        statuses: {
          DRAFT: "Чернетка",
          ACTIVE: "Активний",
          PAUSED: "Призупинений",
          ARCHIVED: "Архівний",
        } satisfies Record<WorkflowStatus, string>,
        triggers: {
          CONTACT_CREATED: "Створено контакт",
          MESSAGE_RECEIVED: "Отримано повідомлення",
          LEAD_QUALIFIED: "Лід кваліфіковано",
          TASK_COMPLETED: "Завдання виконано",
          PIPELINE_STAGE_CHANGED: "Змінено етап воронки",
        } satisfies Record<WorkflowTriggerType, string>,
        actionNames: {
          CREATE_TASK: "Створити завдання",
          ASSIGN_EMPLOYEE: "Призначити AI-співробітника",
          UPDATE_CONTACT_STATUS: "Оновити статус контакту",
          ADD_TAG: "Додати тег",
          SEND_EMAIL: "Надіслати email",
          RUN_AI_PROMPT: "Запустити AI-запит",
        } satisfies Record<WorkflowActionType, string>,
       }
    : {
        eyebrow: "Automation",
        title: "Workflows",
        description:
          "Automate work with leads, contacts, tasks and AI Employees.",
        createWorkflow: "Create workflow",
        total: "Total",
        active: "Active",
        paused: "Paused",
        draft: "Draft",
        archived: "Archived",
        noWorkflows: "No workflows yet",
        noWorkflowsDescription:
          "Create your first workflow to automate repetitive sales processes.",
        noDescription: "No description added.",
        trigger: "Trigger",
        conditions: "Conditions",
        actions: "Actions",
        executions: "Runs",
        updated: "Updated",
        openWorkflow: "Open workflow",
        noTrigger: "Trigger is not configured",
        statuses: {
          DRAFT: "Draft",
          ACTIVE: "Active",
          PAUSED: "Paused",
          ARCHIVED: "Archived",
        } satisfies Record<WorkflowStatus, string>,
        triggers: {
          CONTACT_CREATED: "Contact created",
          MESSAGE_RECEIVED: "Message received",
          LEAD_QUALIFIED: "Lead qualified",
          TASK_COMPLETED: "Task completed",
          PIPELINE_STAGE_CHANGED: "Pipeline stage changed",
        } satisfies Record<WorkflowTriggerType, string>,
        actionNames: {
          CREATE_TASK: "Create task",
          ASSIGN_EMPLOYEE: "Assign AI Employee",
          UPDATE_CONTACT_STATUS: "Update contact status",
          ADD_TAG: "Add tag",
          SEND_EMAIL: "Send email",
          RUN_AI_PROMPT: "Run AI prompt",
        } satisfies Record<WorkflowActionType, string>,
      };

  const activeCount = workflows.filter(
    (workflow) => workflow.status === "ACTIVE",
  ).length;

  const pausedCount = workflows.filter(
    (workflow) => workflow.status === "PAUSED",
  ).length;

  const draftCount = workflows.filter(
    (workflow) => workflow.status === "DRAFT",
  ).length;

  const archivedCount = workflows.filter(
    (workflow) => workflow.status === "ARCHIVED",
  ).length;

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const workflowsHref = `/${locale}/dashboard/workflows`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        stats={
          <>
            <PageHeaderStat
              label={copy.total}
              value={workflows.length}
            />

            <PageHeaderStat
              label={copy.active}
              value={activeCount}
            />

            <PageHeaderStat
              label={copy.paused}
              value={pausedCount}
            />

            <PageHeaderStat
              label={copy.draft}
              value={draftCount}
            />

            {archivedCount > 0 ? (
              <PageHeaderStat
                label={copy.archived}
                value={archivedCount}
              />
            ) : null}
          </>
        }
        actions={
          <Link
            href={`${workflowsHref}/new`}
            className={cn(
              buttonVariants(),
              "gap-2",
            )}
          >
            <Plus className="size-4" />
            {copy.createWorkflow}
          </Link>
        }
      />

      {workflows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title={copy.noWorkflows}
          description={copy.noWorkflowsDescription}
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {workflows.map((workflow) => {
            const firstAction =
              workflow.workflowActions[0];

            return (
              <Card
                key={workflow.id}
                className="group overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4 border-b p-5">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                        {workflow.status === "ACTIVE" ? (
                          <Zap className="size-5" />
                        ) : workflow.status === "PAUSED" ? (
                          <CirclePause className="size-5" />
                        ) : workflow.status === "DRAFT" ? (
                          <FilePenLine className="size-5" />
                        ) : (
                          <Workflow className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold">
                            {workflow.name}
                          </h2>

                          <Badge
                            className={cn(
                              "font-medium",
                              statusClassNames[
                                workflow.status
                              ],
                            )}
                          >
                            {copy.statuses[workflow.status]}
                          </Badge>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {workflow.description ??
                            copy.noDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-px bg-border sm:grid-cols-3">
                    <div className="bg-card p-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Play className="size-3.5" />
                        {copy.trigger}
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        {workflow.trigger
                          ? copy.triggers[
                              workflow.trigger.type
                            ]
                          : copy.noTrigger}
                      </p>
                    </div>

                    <div className="bg-card p-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <GitBranch className="size-3.5" />
                        {copy.conditions}
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        {
                          workflow.workflowConditions
                            .length
                        }
                      </p>
                    </div>

                    <div className="bg-card p-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <CheckCircle2 className="size-3.5" />
                        {copy.actions}
                      </div>

                      <p className="mt-2 truncate text-sm font-medium">
                        {firstAction
                          ? copy.actionNames[
                              firstAction.type
                            ]
                          : "0"}
                      </p>

                      {workflow.workflowActions.length >
                      1 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          +
                          {workflow.workflowActions.length -
                            1}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Activity className="size-3.5" />
                        {copy.executions}:{" "}
                        {workflow._count.executions}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <History className="size-3.5" />
                        {copy.updated}:{" "}
                        {dateFormatter.format(
                          workflow.updatedAt,
                        )}
                      </span>
                    </div>

                    <Link
                      href={`${workflowsHref}/${workflow.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {copy.openWorkflow}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

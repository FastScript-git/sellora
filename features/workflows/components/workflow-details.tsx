import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  CirclePause,
  Clock3,
  FilePenLine,
  GitBranch,
  Pencil,
  History,
  Play,
  Settings2,
  Tag,
  UserRoundCheck,
  Workflow,
  XCircle,
  Zap,
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
import type { getWorkflowById } from "@/features/workflows/repositories/workflow.repository";
import type {
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowExecutionStatus,
  WorkflowStatus,
  WorkflowTriggerType,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";
import { WorkflowArchiveButton } from "@/features/workflows/components/workflow-archive-button";
import { WorkflowDuplicateButton } from "@/features/workflows/components/workflow-duplicate-button";
import { WorkflowRunButton } from "@/features/workflows/components/workflow-run-button";

type WorkflowDetailsData = NonNullable<
  Awaited<ReturnType<typeof getWorkflowById>>
>;

type WorkflowDetailsProps = {
  workflow: WorkflowDetailsData;
  locale: string;
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

const executionStatusClassNames: Record<
  WorkflowExecutionStatus,
  string
> = {
  PENDING:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  RUNNING:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  COMPLETED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  FAILED:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  SKIPPED:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function isJsonObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function formatJsonValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unsupported value";
  }
}

function renderStatusIcon(status: WorkflowStatus) {
  switch (status) {
    case "ACTIVE":
      return <Zap className="size-5" />;

    case "PAUSED":
      return <CirclePause className="size-5" />;

    case "DRAFT":
      return <FilePenLine className="size-5" />;

    case "ARCHIVED":
      return <Workflow className="size-5" />;
  }
}

function getExecutionIcon(
  status: WorkflowExecutionStatus,
) {
  switch (status) {
    case "COMPLETED":
      return CheckCircle2;
    case "FAILED":
      return XCircle;
    case "RUNNING":
      return Activity;
    case "PENDING":
      return Clock3;
    case "SKIPPED":
      return CirclePause;
  }
}

function getActionIcon(type: WorkflowActionType) {
  switch (type) {
    case "CREATE_TASK":
      return CheckCircle2;
    case "ASSIGN_EMPLOYEE":
      return UserRoundCheck;
    case "UPDATE_CONTACT_STATUS":
      return Settings2;
    case "ADD_TAG":
      return Tag;
    case "SEND_EMAIL":
      return Play;
    case "RUN_AI_PROMPT":
      return Bot;
  }
}

export function WorkflowDetails({
  workflow,
  locale,
}: WorkflowDetailsProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        back: "Назад до workflows",
        automation: "Автоматизація",
        noDescription: "Опис не додано.",
        created: "Створено",
        updated: "Оновлено",
        executions: "Запуски",
        trigger: "Тригер",
        triggerDescription:
          "Подія, яка запускає цей workflow.",
        conditions: "Умови",
        conditionsDescription:
          "Усі умови повинні виконатися перед запуском дій.",
        noConditions:
          "Умов немає. Workflow продовжиться після кожного спрацювання тригера.",
        actions: "Дії",
        actionsDescription:
          "Дії виконуються послідовно у вказаному порядку.",
        noActions: "Дії не налаштовані.",
        executionHistory: "Історія запусків",
        executionHistoryDescription:
          "Останні 20 виконань workflow та їхні логи.",
        noExecutions: "Workflow ще не запускався.",
        position: "Позиція",
        config: "Налаштування",
        input: "Вхідні дані",
        output: "Результат",
        logs: "Логи",
        noLogs: "Логів немає.",
        statuses: {
          DRAFT: "Чернетка",
          ACTIVE: "Активний",
          PAUSED: "Призупинений",
          ARCHIVED: "Архівний",
        } satisfies Record<WorkflowStatus, string>,
        executionStatuses: {
          PENDING: "Очікує",
          RUNNING: "Виконується",
          COMPLETED: "Завершено",
          FAILED: "Помилка",
          SKIPPED: "Пропущено",
        } satisfies Record<
          WorkflowExecutionStatus,
          string
        >,
        triggers: {
          CONTACT_CREATED: "Створено контакт",
          MESSAGE_RECEIVED: "Отримано повідомлення",
          LEAD_QUALIFIED: "Лід кваліфіковано",
          TASK_COMPLETED: "Завдання виконано",
          PIPELINE_STAGE_CHANGED:
            "Змінено етап воронки",
        } satisfies Record<WorkflowTriggerType, string>,
        operators: {
          EQUALS: "Дорівнює",
          NOT_EQUALS: "Не дорівнює",
          GREATER_THAN: "Більше",
          GREATER_THAN_OR_EQUAL:
            "Більше або дорівнює",
          LESS_THAN: "Менше",
          LESS_THAN_OR_EQUAL:
            "Менше або дорівнює",
          CONTAINS: "Містить",
          NOT_CONTAINS: "Не містить",
          EXISTS: "Існує",
          NOT_EXISTS: "Не існує",
        } satisfies Record<
          WorkflowConditionOperator,
          string
        >,
        actionNames: {
          CREATE_TASK: "Створити завдання",
          ASSIGN_EMPLOYEE:
            "Призначити AI-співробітника",
          UPDATE_CONTACT_STATUS:
            "Оновити статус контакту",
          ADD_TAG: "Додати тег",
          SEND_EMAIL: "Надіслати email",
          RUN_AI_PROMPT: "Запустити AI-запит",
        } satisfies Record<WorkflowActionType, string>,
      }
    : {
        back: "Back to workflows",
        automation: "Automation",
        noDescription: "No description added.",
        created: "Created",
        updated: "Updated",
        executions: "Runs",
        trigger: "Trigger",
        triggerDescription:
          "The event that starts this workflow.",
        conditions: "Conditions",
        conditionsDescription:
          "All conditions must pass before actions are executed.",
        noConditions:
          "No conditions. The workflow continues every time its trigger occurs.",
        actions: "Actions",
        actionsDescription:
          "Actions are executed sequentially in the configured order.",
        noActions: "No actions configured.",
        executionHistory: "Execution history",
        executionHistoryDescription:
          "The latest 20 workflow executions and their logs.",
        noExecutions: "This workflow has not run yet.",
        position: "Position",
        config: "Configuration",
        input: "Input",
        output: "Output",
        logs: "Logs",
        noLogs: "No logs available.",
        statuses: {
          DRAFT: "Draft",
          ACTIVE: "Active",
          PAUSED: "Paused",
          ARCHIVED: "Archived",
        } satisfies Record<WorkflowStatus, string>,
        executionStatuses: {
          PENDING: "Pending",
          RUNNING: "Running",
          COMPLETED: "Completed",
          FAILED: "Failed",
          SKIPPED: "Skipped",
        } satisfies Record<
          WorkflowExecutionStatus,
          string
        >,
        triggers: {
          CONTACT_CREATED: "Contact created",
          MESSAGE_RECEIVED: "Message received",
          LEAD_QUALIFIED: "Lead qualified",
          TASK_COMPLETED: "Task completed",
          PIPELINE_STAGE_CHANGED:
            "Pipeline stage changed",
        } satisfies Record<WorkflowTriggerType, string>,
        operators: {
          EQUALS: "Equals",
          NOT_EQUALS: "Does not equal",
          GREATER_THAN: "Greater than",
          GREATER_THAN_OR_EQUAL:
            "Greater than or equal",
          LESS_THAN: "Less than",
          LESS_THAN_OR_EQUAL:
            "Less than or equal",
          CONTAINS: "Contains",
          NOT_CONTAINS: "Does not contain",
          EXISTS: "Exists",
          NOT_EXISTS: "Does not exist",
        } satisfies Record<
          WorkflowConditionOperator,
          string
        >,
        actionNames: {
          CREATE_TASK: "Create task",
          ASSIGN_EMPLOYEE: "Assign AI employee",
          UPDATE_CONTACT_STATUS:
            "Update contact status",
          ADD_TAG: "Add tag",
          SEND_EMAIL: "Send email",
          RUN_AI_PROMPT: "Run AI prompt",
        } satisfies Record<WorkflowActionType, string>,
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  

  const workflowsPath = `/${locale}/dashboard/workflows`;
  const editWorkflowPath = `${workflowsPath}/${workflow.id}/edit`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-5">
        <Link
          href={workflowsPath}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "-ml-2 gap-2",
          )}
        >
          <ArrowLeft className="size-4" />
          {copy.back}
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
              {renderStatusIcon(workflow.status)}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {copy.automation}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {workflow.name}
                </h1>

                <Badge
                  className={cn(
                    "font-medium",
                    statusClassNames[workflow.status],
                  )}
                >
                  {copy.statuses[workflow.status]}
                </Badge>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {workflow.description ??
                  copy.noDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={editWorkflowPath}
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "gap-2",
              )}
            >
              <Pencil className="size-4" />
              {isUkrainian
                ? "Редагувати workflow"
                : "Edit workflow"}
            </Link>

            <WorkflowDuplicateButton
              workflowId={workflow.id}
              locale={locale}
            />

            <WorkflowRunButton
              workflowId={workflow.id}
            />

            <WorkflowArchiveButton
              workflowId={workflow.id}
              locale={locale}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {copy.created}
              </p>
              <p className="mt-1 text-sm font-medium">
                {dateFormatter.format(workflow.createdAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {copy.updated}
              </p>
              <p className="mt-1 text-sm font-medium">
                {dateFormatter.format(workflow.updatedAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {copy.executions}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {workflow.executions.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <Play className="size-4" />
            </div>

            <div>
              <CardTitle>{copy.trigger}</CardTitle>
              <CardDescription>
                {copy.triggerDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {workflow.trigger ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">
                {copy.triggers[workflow.trigger.type]}
              </p>

              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {workflow.trigger.type}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              —
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <GitBranch className="size-4" />
            </div>

            <div>
              <CardTitle>{copy.conditions}</CardTitle>
              <CardDescription>
                {copy.conditionsDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {workflow.workflowConditions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
              {copy.noConditions}
            </div>
          ) : (
            <div className="space-y-3">
              {workflow.workflowConditions.map(
                (condition, index) => (
                  <div
                    key={condition.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Badge variant="outline">
                        {index + 1}
                      </Badge>

                      <code className="text-sm font-medium">
                        {condition.field}
                      </code>

                      <span className="text-sm text-muted-foreground">
                        {copy.operators[
                          condition.operator
                        ]}
                      </span>

                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {formatJsonValue(condition.value)}
                      </code>
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
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <Settings2 className="size-4" />
            </div>

            <div>
              <CardTitle>{copy.actions}</CardTitle>
              <CardDescription>
                {copy.actionsDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {workflow.workflowActions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
              {copy.noActions}
            </div>
          ) : (
            <div className="space-y-3">
              {workflow.workflowActions.map(
                (action, index) => {
                  const ActionIcon = getActionIcon(
                    action.type,
                  );

                  const config = isJsonObject(
                    action.config,
                  )
                    ? Object.entries(action.config)
                    : [];

                  return (
                    <div
                      key={action.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <ActionIcon className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {index + 1}.{" "}
                              {copy.actionNames[action.type]}
                            </p>

                            <Badge variant="outline">
                              {action.type}
                            </Badge>
                          </div>

                          {config.length > 0 ? (
                            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                              {config.map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="rounded-md bg-muted/50 p-3"
                                  >
                                    <dt className="text-xs font-medium text-muted-foreground">
                                      {key}
                                    </dt>
                                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                                      {formatJsonValue(value)}
                                    </dd>
                                  </div>
                                ),
                              )}
                            </dl>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <History className="size-4" />
            </div>

            <div>
              <CardTitle>
                {copy.executionHistory}
              </CardTitle>
              <CardDescription>
                {copy.executionHistoryDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {workflow.executions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <CalendarDays className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                {copy.noExecutions}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflow.executions.map((execution) => {
                const ExecutionIcon = getExecutionIcon(
                  execution.status,
                );

                return (
                  <details
                    key={execution.id}
                    className="group rounded-lg border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <ExecutionIcon className="size-4 shrink-0" />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {execution.id}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {dateFormatter.format(
                              execution.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <Badge
                        className={cn(
                          "shrink-0 font-medium",
                          executionStatusClassNames[
                            execution.status
                          ],
                        )}
                      >
                        {
                          copy.executionStatuses[
                            execution.status
                          ]
                        }
                      </Badge>
                    </summary>

                    <div className="space-y-5 border-t p-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {copy.input}
                          </p>
                          <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                            {formatJsonValue(
                              execution.input,
                            )}
                          </pre>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {copy.output}
                          </p>
                          <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                            {formatJsonValue(
                              execution.output,
                            )}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {copy.logs}
                        </p>

                        {execution.logs.length === 0 ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {copy.noLogs}
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {execution.logs.map((log) => (
                              <div
                                key={log.id}
                                className="rounded-lg bg-muted/50 p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <Badge variant="outline">
                                    {log.level}
                                  </Badge>

                                  <span className="text-xs text-muted-foreground">
                                    {dateFormatter.format(
                                      log.createdAt,
                                    )}
                                  </span>
                                </div>

                                <p className="mt-2 text-sm">
                                  {log.message}
                                </p>

                                {log.metadata ? (
                                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
                                    {formatJsonValue(
                                      log.metadata,
                                    )}
                                  </pre>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

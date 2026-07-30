"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateTaskStatus } from "@/features/tasks/actions/update-task-status";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

type ContactTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: Date | null;
  completedAt: Date | null;
  reminderAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  employee: {
    id: string;
    name: string;
  } | null;
};

type ContactTasksProps = {
  tasks: ContactTask[];
  workspaceId: string;
  locale: string;
};

export function ContactTasks({
  tasks,
  workspaceId,
  locale,
}: ContactTasksProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [pendingTaskId, setPendingTaskId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "AI-завдання",
        description:
          "Дії, які AI рекомендує виконати для цього контакту.",
        emptyTitle: "Завдань поки немає",
        emptyDescription:
          "Коли AI визначить наступну дію, вона автоматично з’явиться тут.",
        created: "Створено",
        due: "Виконати до",
        reminder: "Нагадування",
        assignedTo: "Виконавець",
        start: "Почати",
        complete: "Завершити",
        reopen: "Відкрити знову",
        updateError:
          "Не вдалося змінити статус завдання. Спробуйте ще раз.",
        statuses: {
          TODO: "До виконання",
          IN_PROGRESS: "У роботі",
          COMPLETED: "Виконано",
          CANCELED: "Скасовано",
        },
        priorities: {
          LOW: "Низький",
          MEDIUM: "Середній",
          HIGH: "Високий",
          URGENT: "Терміновий",
        },
      }
    : {
        title: "AI Tasks",
        description:
          "Actions the AI recommends for this contact.",
        emptyTitle: "No tasks yet",
        emptyDescription:
          "When the AI identifies a next action, it will appear here automatically.",
        created: "Created",
        due: "Due",
        reminder: "Reminder",
        assignedTo: "Assigned to",
        start: "Start",
        complete: "Complete",
        reopen: "Reopen",
        updateError:
          "Could not update the task status. Please try again.",
        statuses: {
          TODO: "To do",
          IN_PROGRESS: "In progress",
          COMPLETED: "Completed",
          CANCELED: "Canceled",
        },
        priorities: {
          LOW: "Low",
          MEDIUM: "Medium",
          HIGH: "High",
          URGENT: "Urgent",
        },
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const activeTasks = tasks.filter(
    (task) =>
      task.status === "TODO" ||
      task.status === "IN_PROGRESS",
  );

  const inactiveTasks = tasks.filter(
    (task) =>
      task.status === "COMPLETED" ||
      task.status === "CANCELED",
  );

  function handleStatusChange(
    taskId: string,
    status: TaskStatus,
  ) {
    setError(null);
    setPendingTaskId(taskId);

    startTransition(async () => {
      try {
        await updateTaskStatus({
          taskId,
          workspaceId,
          status,
        });

        router.refresh();
      } catch (taskError) {
        console.error(
          "Failed to update task status:",
          taskError,
        );

        setError(copy.updateError);
      } finally {
        setPendingTaskId(null);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              {copy.title}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {copy.description}
            </p>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Sparkles className="size-4 text-muted-foreground" />
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {tasks.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/40">
              <ListTodo className="size-5 text-muted-foreground" />
            </span>

            <p className="mt-4 text-sm font-medium">
              {copy.emptyTitle}
            </p>

            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.length > 0 ? (
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    dateFormatter={dateFormatter}
                    copy={copy}
                    isUpdating={
                      isPending &&
                      pendingTaskId === task.id
                    }
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : null}

            {inactiveTasks.length > 0 ? (
              <div className="space-y-3 border-t pt-4">
                {inactiveTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    dateFormatter={dateFormatter}
                    copy={copy}
                    isUpdating={
                      isPending &&
                      pendingTaskId === task.id
                    }
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type TaskCopy = {
  created: string;
  due: string;
  reminder: string;
  assignedTo: string;
  start: string;
  complete: string;
  reopen: string;
  statuses: Record<TaskStatus, string>;
  priorities: Record<TaskPriority, string>;
};

type TaskItemProps = {
  task: ContactTask;
  dateFormatter: Intl.DateTimeFormat;
  copy: TaskCopy;
  isUpdating: boolean;
  onStatusChange: (
    taskId: string,
    status: TaskStatus,
  ) => void;
};

function TaskItem({
  task,
  dateFormatter,
  copy,
  isUpdating,
  onStatusChange,
}: TaskItemProps) {
  const isInactive =
    task.status === "COMPLETED" ||
    task.status === "CANCELED";

  const action = getTaskAction(task.status, copy);

  return (
    <article
      className={[
        "rounded-xl border p-4",
        isInactive ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-muted-foreground">
          {getStatusIcon(task.status)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h3
                className={[
                  "break-words text-sm font-medium",
                  task.status === "COMPLETED"
                    ? "line-through"
                    : "",
                ].join(" ")}
              >
                {task.title}
              </h3>

              {task.description ? (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                {copy.statuses[task.status]}
              </span>

              <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                {copy.priorities[task.priority]}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <TaskMeta
              icon={<Clock3 className="size-3.5" />}
              label={copy.created}
              value={dateFormatter.format(task.createdAt)}
            />

            {task.dueAt ? (
              <TaskMeta
                icon={
                  <CalendarClock className="size-3.5" />
                }
                label={copy.due}
                value={dateFormatter.format(task.dueAt)}
              />
            ) : null}

            {task.reminderAt ? (
              <TaskMeta
                icon={<Clock3 className="size-3.5" />}
                label={copy.reminder}
                value={dateFormatter.format(
                  task.reminderAt,
                )}
              />
            ) : null}

            {task.employee ? (
              <TaskMeta
                icon={<UserRound className="size-3.5" />}
                label={copy.assignedTo}
                value={task.employee.name}
              />
            ) : null}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                onStatusChange(
                  task.id,
                  action.nextStatus,
                )
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                action.icon
              )}

              {action.label}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

type TaskMetaProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function TaskMeta({
  icon,
  label,
  value,
}: TaskMetaProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}

      <span>
        {label}: {value}
      </span>
    </span>
  );
}

function getTaskAction(
  status: TaskStatus,
  copy: TaskCopy,
) {
  if (status === "TODO") {
    return {
      label: copy.start,
      nextStatus: "IN_PROGRESS" as const,
      icon: <Clock3 className="size-4" />,
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      label: copy.complete,
      nextStatus: "COMPLETED" as const,
      icon: <CheckCircle2 className="size-4" />,
    };
  }

  return {
    label: copy.reopen,
    nextStatus: "TODO" as const,
    icon: <RotateCcw className="size-4" />,
  };
}

function getStatusIcon(status: TaskStatus) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="size-5" />;
  }

  if (status === "IN_PROGRESS") {
    return <Clock3 className="size-5" />;
  }

  return <Circle className="size-5" />;
}
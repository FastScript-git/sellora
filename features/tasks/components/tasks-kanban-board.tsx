"use client";

import {
  DragDropProvider,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import {
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  GripVertical,
  Mail,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useMemo,
  useState,
  useTransition,
} from "react";

import { Badge } from "@/components/ui/badge";
import { updateTaskStatus } from "@/features/tasks/actions/update-task-status";
import type {
  TaskPriority,
  TaskStatus,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

export type TasksKanbanItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    company: string | null;
  } | null;
  employee: {
    id: string;
    name: string;
    role: string;
  } | null;
};

type TasksKanbanBoardProps = {
  tasks: TasksKanbanItem[];
  workspaceId: string;
  locale: string;
};

const columns: Array<{
  status: TaskStatus;
  icon: typeof Circle;
}> = [
  {
    status: "TODO",
    icon: Circle,
  },
  {
    status: "IN_PROGRESS",
    icon: Clock3,
  },
  {
    status: "COMPLETED",
    icon: CheckCircle2,
  },
  {
    status: "CANCELED",
    icon: XCircle,
  },
];

export function TasksKanbanBoard({
  tasks: initialTasks,
  workspaceId,
  locale,
}: TasksKanbanBoardProps) {
  const [tasks, setTasks] =
    useState<TasksKanbanItem[]>(initialTasks);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [isPending, startTransition] = useTransition();

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
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
        empty: "Перетягніть завдання сюди",
        noDueDate: "Без дедлайну",
        contact: "Контакт",
        employee: "AI-співробітник",
        unassigned: "Не призначено",
        overdue: "Прострочено",
        updateError:
          "Не вдалося змінити статус завдання.",
      }
    : {
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
        empty: "Drop tasks here",
        noDueDate: "No due date",
        contact: "Contact",
        employee: "AI Employee",
        unassigned: "Unassigned",
        overdue: "Overdue",
        updateError: "Failed to update task status.",
      };

  const tasksByStatus = useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => [
          column.status,
          tasks.filter(
            (task) => task.status === column.status,
          ),
        ]),
      ) as Record<TaskStatus, TasksKanbanItem[]>,
    [tasks],
  );

  function moveTask(
    taskId: string,
    nextStatus: TaskStatus,
  ): void {
    const currentTask = tasks.find(
      (task) => task.id === taskId,
    );

    if (
      !currentTask ||
      currentTask.status === nextStatus ||
      isPending
    ) {
      return;
    }

    const previousTasks = tasks;

    setError(null);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
            }
          : task,
      ),
    );

    startTransition(async () => {
      try {
        await updateTaskStatus({
          taskId,
          workspaceId,
          status: nextStatus,
        });
      } catch (caughtError) {
        console.error(
          "Failed to move task:",
          caughtError,
        );

        setTasks(previousTasks);
        setError(copy.updateError);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) {
            return;
          }

          const taskId = String(
            event.operation.source?.id ?? "",
          );

          const targetStatus = String(
            event.operation.target?.id ?? "",
          ) as TaskStatus;

          if (
            !taskId ||
            !columns.some(
              (column) =>
                column.status === targetStatus,
            )
          ) {
            return;
          }

          moveTask(taskId, targetStatus);
        }}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <TaskKanbanColumn
              key={column.status}
              status={column.status}
              icon={column.icon}
              title={copy.statuses[column.status]}
              emptyLabel={copy.empty}
              tasks={tasksByStatus[column.status]}
              locale={locale}
              copy={copy}
              disabled={isPending}
              onMoveTask={moveTask}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}

type KanbanCopy = {
  statuses: Record<TaskStatus, string>;
  priorities: Record<TaskPriority, string>;
  empty: string;
  noDueDate: string;
  contact: string;
  employee: string;
  unassigned: string;
  overdue: string;
  updateError: string;
};

type TaskKanbanColumnProps = {
  status: TaskStatus;
  icon: typeof Circle;
  title: string;
  emptyLabel: string;
  tasks: TasksKanbanItem[];
  locale: string;
  copy: KanbanCopy;
  disabled: boolean;
  onMoveTask: (
    taskId: string,
    status: TaskStatus,
  ) => void;
};

function TaskKanbanColumn({
  status,
  icon: Icon,
  title,
  emptyLabel,
  tasks,
  locale,
  copy,
  disabled,
  onMoveTask,
}: TaskKanbanColumnProps) {
  const { ref } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={ref}
      className="flex min-h-[560px] min-w-0 flex-col rounded-2xl border bg-muted/15"
    >
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-muted-foreground" />

          <h2 className="truncate text-sm font-semibold">
            {title}
          </h2>
        </div>

        <span className="inline-flex min-w-6 items-center justify-center rounded-full border bg-background px-2 py-0.5 text-xs font-medium">
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed px-4 text-center">
            <p className="text-xs text-muted-foreground">
              {emptyLabel}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskKanbanCard
              key={task.id}
              task={task}
              locale={locale}
              copy={copy}
              disabled={disabled}
              onMoveTask={onMoveTask}
            />
          ))
        )}
      </div>
    </section>
  );
}

type TaskKanbanCardProps = {
  task: TasksKanbanItem;
  locale: string;
  copy: KanbanCopy;
  disabled: boolean;
  onMoveTask: (
    taskId: string,
    status: TaskStatus,
  ) => void;
};

function TaskKanbanCard({
  task,
  locale,
  copy,
  disabled,
  onMoveTask,
}: TaskKanbanCardProps) {
  const { ref } = useDraggable({
    id: task.id,
  });

  const now = new Date();

  const dueAt = task.dueAt
    ? new Date(task.dueAt)
    : null;

  const isOverdue =
    dueAt !== null &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELED" &&
    dueAt < now;

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "uk" ? "uk-UA" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const contactName = task.contact
    ? [
        task.contact.firstName,
        task.contact.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      task.contact.email ||
      copy.contact
    : null;

  return (
    <article
      ref={ref}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm",
        disabled && "pointer-events-none opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Drag task"
          className="mt-0.5 shrink-0 cursor-grab rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-medium leading-5",
              task.status === "COMPLETED" &&
                "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </h3>

          {task.description ? (
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
              {task.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {copy.priorities[task.priority]}
        </Badge>

        {isOverdue ? (
          <Badge variant="destructive">
            {copy.overdue}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div
          className={cn(
            "flex items-center gap-2",
            isOverdue && "text-destructive",
          )}
        >
          <CalendarDays className="size-3.5 shrink-0" />

          <span>
            {dueAt
              ? dateFormatter.format(dueAt)
              : copy.noDueDate}
          </span>
        </div>

        {task.contact ? (
          <Link
            href={`/${locale}/dashboard/contacts/${task.contact.id}`}
            className="flex min-w-0 items-center gap-2 transition-colors hover:text-foreground"
          >
            <UserRound className="size-3.5 shrink-0" />

            <span className="truncate">
              {contactName}
            </span>
          </Link>
        ) : null}

        {task.contact?.company ? (
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="size-3.5 shrink-0" />

            <span className="truncate">
              {task.contact.company}
            </span>
          </div>
        ) : null}

        {task.contact?.email ? (
          <div className="flex min-w-0 items-center gap-2">
            <Mail className="size-3.5 shrink-0" />

            <span className="truncate">
              {task.contact.email}
            </span>
          </div>
        ) : null}

        <div className="flex min-w-0 items-center gap-2">
          <Bot className="size-3.5 shrink-0" />

          <span className="truncate">
            {task.employee?.name || copy.unassigned}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <select
          value={task.status}
          disabled={disabled}
          aria-label="Task status"
          onChange={(event) =>
            onMoveTask(
              task.id,
              event.target.value as TaskStatus,
            )
          }
          className="h-9 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {columns.map((column) => (
            <option
              key={column.status}
              value={column.status}
            >
              {copy.statuses[column.status]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

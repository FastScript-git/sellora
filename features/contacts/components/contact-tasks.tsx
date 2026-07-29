import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ContactTask = {
  id: string;
  title: string;
  description: string | null;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELED";
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";
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
  locale: string;
};

export function ContactTasks({
  tasks,
  locale,
}: ContactTasksProps) {
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
                    locale={locale}
                    dateFormatter={dateFormatter}
                    copy={copy}
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
                    locale={locale}
                    dateFormatter={dateFormatter}
                    copy={copy}
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

type TaskItemProps = {
  task: ContactTask;
  locale: string;
  dateFormatter: Intl.DateTimeFormat;
  copy: {
    created: string;
    due: string;
    reminder: string;
    assignedTo: string;
    statuses: Record<ContactTask["status"], string>;
    priorities: Record<ContactTask["priority"], string>;
  };
};

function TaskItem({
  task,
  dateFormatter,
  copy,
}: TaskItemProps) {
  const isInactive =
    task.status === "COMPLETED" ||
    task.status === "CANCELED";

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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

function getStatusIcon(
  status: ContactTask["status"],
) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="size-5" />;
  }

  if (status === "IN_PROGRESS") {
    return <Clock3 className="size-5" />;
  }

  return <Circle className="size-5" />;
}
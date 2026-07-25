import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  Plus,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/shared/empty-state";
import {
  PageHeader,
  PageHeaderStat,
} from "@/components/dashboard/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTasksByWorkspace } from "@/features/tasks/repositories/task.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatTaskStatus(status: string) {
  switch (status) {
    case "TODO":
      return "To do";
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELED":
      return "Canceled";
    default:
      return status;
  }
}

function formatTaskPriority(priority: string) {
  switch (priority) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Medium";
    case "HIGH":
      return "High";
    case "URGENT":
      return "Urgent";
    default:
      return priority;
  }
}

function formatDueDate(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusIcon(status: string) {
  if (status === "COMPLETED") {
    return CheckCircle2;
  }

  if (status === "IN_PROGRESS") {
    return Clock3;
  }

  return Circle;
}

export default async function TasksPage() {
  const workspace = await getCurrentWorkspace();
  const tasks = await getTasksByWorkspace({
  workspaceId: workspace.id,
});
  const now = new Date();

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  const openTasks = tasks.filter(
    (task) =>
      task.status === "TODO" ||
      task.status === "IN_PROGRESS",
  ).length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueAt || task.status === "COMPLETED") {
      return false;
    }

    return task.dueAt < now;
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM"
        title="Tasks"
        description="Manage work for contacts and AI Employees."
        stats={
          <>
            <PageHeaderStat
              label="All tasks"
              value={tasks.length}
            />

            <PageHeaderStat
              label="Open"
              value={openTasks}
            />

            <PageHeaderStat
              label="Completed"
              value={completedTasks}
            />

            <PageHeaderStat
              label="Overdue"
              value={overdueTasks}
            />
          </>
        }
        actions={
          <Button type="button">
            <Plus className="size-4" />
            New Task
          </Button>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks yet"
          description="Create your first task to start organizing work across your contacts and AI Employees."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);

            const isOverdue =
              task.dueAt !== null &&
              task.status !== "COMPLETED" &&
              task.dueAt < now;

            return (
              <Card key={task.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <StatusIcon
                      className={cn(
                        "mt-0.5 size-5 shrink-0 text-muted-foreground",
                        task.status === "COMPLETED" &&
                          "text-foreground",
                      )}
                    />

                    <div className="min-w-0">
                      <h2
                        className={cn(
                          "font-medium",
                          task.status === "COMPLETED" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </h2>

                      {task.description ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {formatTaskStatus(task.status)}
                        </Badge>

                        <Badge variant="secondary">
                          {formatTaskPriority(task.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-2 text-sm text-muted-foreground",
                      isOverdue && "font-medium text-destructive",
                    )}
                  >
                    <CalendarDays className="size-4" />
                    {formatDueDate(task.dueAt)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
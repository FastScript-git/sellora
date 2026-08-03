import {
  ClipboardList,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/shared/empty-state";
import {
  PageHeader,
  PageHeaderStat,
} from "@/components/dashboard/shared/page-header";
import { getAIEmployees } from "@/features/ai-employees/queries";
import { getContactsByWorkspace } from "@/features/contacts/repositories/contact.repository";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import {
  TasksKanbanBoard,
  type TasksKanbanItem,
} from "@/features/tasks/components/tasks-kanban-board";
import { TasksFilters } from "@/features/tasks/components/tasks-filters";
import { getTasksByWorkspace } from "@/features/tasks/repositories/task.repository";
import type {
  TaskPriority,
  TaskStatus,
} from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const dynamic = "force-dynamic";

const taskStatuses: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
];

const taskPriorities: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

type TasksPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    status?: string;
    priority?: string;
    contact?: string;
    employee?: string;
  }>;
};

export default async function TasksPage({
  params,
  searchParams,
}: TasksPageProps) {
  const { locale } = await params;

  const {
    status: statusParam,
    priority: priorityParam,
    contact: contactId,
    employee: employeeId,
  } = await searchParams;

  const workspace = await getCurrentWorkspace();

  const status = isTaskStatus(statusParam)
    ? statusParam
    : undefined;

  const priority = isTaskPriority(priorityParam)
    ? priorityParam
    : undefined;

  const [tasks, contacts, employees] =
    await Promise.all([
      getTasksByWorkspace({
        workspaceId: workspace.id,
        status,
        priority,
        contactId: contactId || undefined,
        employeeId: employeeId || undefined,
      }),

      getContactsByWorkspace(workspace.id),

      getAIEmployees({
        workspaceId: workspace.id,
      }),
    ]);

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "CRM",
        title: "Завдання",
        description:
          "Керуйте роботою з контактами та AI-співробітниками.",
        allTasks: "Усі завдання",
        open: "Відкриті",
        completed: "Виконані",
        overdue: "Прострочені",
        noTasks: "Завдань не знайдено",
        noTasksDescription:
          "Створіть нове завдання або змініть параметри фільтрів.",
        noDueDate: "Без дедлайну",
        anonymous: "Анонімний контакт",
        contact: "Контакт",
        employee: "AI-співробітник",
        unassigned: "Не призначено",
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
        eyebrow: "CRM",
        title: "Tasks",
        description:
          "Manage work for contacts and AI Employees.",
        allTasks: "All tasks",
        open: "Open",
        completed: "Completed",
        overdue: "Overdue",
        noTasks: "No tasks found",
        noTasksDescription:
          "Create a new task or change the selected filters.",
        noDueDate: "No due date",
        anonymous: "Anonymous contact",
        contact: "Contact",
        employee: "AI Employee",
        unassigned: "Unassigned",
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
    if (
      !task.dueAt ||
      task.status === "COMPLETED" ||
      task.status === "CANCELED"
    ) {
      return false;
    }

    return task.dueAt < now;
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        stats={
          <>
            <PageHeaderStat
              label={copy.allTasks}
              value={tasks.length}
            />

            <PageHeaderStat
              label={copy.open}
              value={openTasks}
            />

            <PageHeaderStat
              label={copy.completed}
              value={completedTasks}
            />

            <PageHeaderStat
              label={copy.overdue}
              value={overdueTasks}
            />
          </>
        }
        actions={<CreateTaskDialog />}
      />

      <TasksFilters
        contacts={contacts.map((contact) => ({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
        }))}
        employees={employees.map((employee) => ({
          id: employee.id,
          name: employee.name,
        }))}
        locale={locale}
        selectedStatus={status}
        selectedPriority={priority}
        selectedContactId={contactId}
        selectedEmployeeId={employeeId}
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={copy.noTasks}
          description={copy.noTasksDescription}
        />
      ) : (
        <TasksKanbanBoard
          workspaceId={workspace.id}
          locale={locale}
          tasks={tasks.map(
            (task): TasksKanbanItem => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueAt: task.dueAt
                ? task.dueAt.toISOString()
                : null,
              contact: task.contact
                ? {
                    id: task.contact.id,
                    firstName:
                      task.contact.firstName,
                    lastName:
                      task.contact.lastName,
                    email: task.contact.email,
                    company: task.contact.company,
                  }
                : null,
              employee: task.employee
                ? {
                    id: task.employee.id,
                    name: task.employee.name,
                    role: task.employee.role,
                  }
                : null,
            }),
          )}
        />
      )}
    </div>
  );
}

function isTaskStatus(
  value: string | undefined,
): value is TaskStatus {
  return (
    value !== undefined &&
    taskStatuses.includes(value as TaskStatus)
  );
}

function isTaskPriority(
  value: string | undefined,
): value is TaskPriority {
  return (
    value !== undefined &&
    taskPriorities.includes(value as TaskPriority)
  );
}

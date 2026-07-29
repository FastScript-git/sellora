import type {
  TaskPriority,
  TaskStatus,
} from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type GetTasksByWorkspaceParams = {
  workspaceId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  contactId?: string;
  employeeId?: string;
};

export async function getTasksByWorkspace({
  workspaceId,
  status,
  priority,
  contactId,
  employeeId,
}: GetTasksByWorkspaceParams) {
  return prisma.task.findMany({
    where: {
      workspaceId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(contactId ? { contactId } : {}),
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          status: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        dueAt: {
          sort: "asc",
          nulls: "last",
        },
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

type GetTaskByIdParams = {
  taskId: string;
  workspaceId: string;
};

export async function getTaskById({
  taskId,
  workspaceId,
}: GetTaskByIdParams) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          jobTitle: true,
          status: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

type CreateTaskParams = {
  workspaceId: string;
  title: string;
  description?: string | null;
  contactId?: string | null;
  employeeId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: Date | null;
  reminderAt?: Date | null;
};

export async function createTask({
  workspaceId,
  title,
  description,
  contactId,
  employeeId,
  status = "TODO",
  priority = "MEDIUM",
  dueAt,
  reminderAt,
}: CreateTaskParams) {
  return prisma.task.create({
    data: {
      workspaceId,
      title,
      description,
      contactId,
      employeeId,
      status,
      priority,
      dueAt,
      reminderAt,
    },
  });
}

type UpdateTaskParams = {
  taskId: string;
  workspaceId: string;
  title?: string;
  description?: string | null;
  contactId?: string | null;
  employeeId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: Date | null;
  reminderAt?: Date | null;
  completedAt?: Date | null;
};

export async function updateTask({
  taskId,
  workspaceId,
  ...data
}: UpdateTaskParams) {
  return prisma.task.updateMany({
    where: {
      id: taskId,
      workspaceId,
    },
    data,
  });
}

type UpdateTaskStatusParams = {
  taskId: string;
  workspaceId: string;
  status: TaskStatus;
};

export async function updateTaskStatus({
  taskId,
  workspaceId,
  status,
}: UpdateTaskStatusParams) {
  const completedAt =
    status === "COMPLETED" ? new Date() : null;

  return prisma.task.updateMany({
    where: {
      id: taskId,
      workspaceId,
    },
    data: {
      status,
      completedAt,
    },
  });
}

type DeleteTaskParams = {
  taskId: string;
  workspaceId: string;
};

export async function deleteTask({
  taskId,
  workspaceId,
}: DeleteTaskParams) {
  return prisma.task.deleteMany({
    where: {
      id: taskId,
      workspaceId,
    },
  });
}

type GetContactTasksParams = {
  workspaceId: string;
  contactId: string;
};

export async function getContactTasks({
  workspaceId,
  contactId,
}: GetContactTasksParams) {
  return prisma.task.findMany({
    where: {
      workspaceId,
      contactId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        dueAt: {
          sort: "asc",
          nulls: "last",
        },
      },
      {
        createdAt: "desc",
      },
    ],
  });
}
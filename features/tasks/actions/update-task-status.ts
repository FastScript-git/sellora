"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

type UpdateTaskStatusInput = {
  taskId: string;
  workspaceId: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
};

export async function updateTaskStatus({
  taskId,
  workspaceId,
  status,
}: UpdateTaskStatusInput) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status,
      completedAt:
        status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/contacts");
  revalidatePath("/dashboard/tasks");
}
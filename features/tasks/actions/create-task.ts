"use server";

import { revalidatePath } from "next/cache";

import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/features/tasks/actions/task.schemas";
import { createTask } from "@/features/tasks/repositories/task.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type CreateTaskResult =
  | {
      success: true;
      taskId: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function createTaskAction(
  input: CreateTaskInput,
): Promise<CreateTaskResult> {
  const parsedInput = createTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid task data.",
      fieldErrors:
        parsedInput.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    description,
    contactId,
    employeeId,
    priority,
    dueAt,
    reminderAt,
    locale,
  } = parsedInput.data;

  try {
    const workspace = await getCurrentWorkspace();

    const task = await createTask({
      workspaceId: workspace.id,
      title,
      description,
      contactId,
      employeeId,
      priority,
      dueAt,
      reminderAt,
    });

    revalidatePath(
      `/${locale}/dashboard/tasks`,
    );

    if (contactId) {
      revalidatePath(
        `/${locale}/dashboard/contacts/${contactId}`,
      );
    }

    return {
      success: true,
      taskId: task.id,
    };
  } catch (error) {
    console.error("Failed to create task:", error);

    return {
      success: false,
      error: "Failed to create task.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import {
  type UpdateTaskStatusInput,
  updateTaskStatusSchema,
} from "@/features/tasks/actions/task.schemas";
import {
  getTaskById,
  updateTaskStatus,
} from "@/features/tasks/repositories/task.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type UpdateTaskStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function updateTaskStatusAction(
  input: UpdateTaskStatusInput,
): Promise<UpdateTaskStatusResult> {
  const parsedInput =
    updateTaskStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid task status data.",
    };
  }

  const {
    taskId,
    status,
    locale,
  } = parsedInput.data;

  try {
    const workspace = await getCurrentWorkspace();

    const task = await getTaskById({
      taskId,
      workspaceId: workspace.id,
    });

    if (!task) {
      return {
        success: false,
        error: "Task was not found.",
      };
    }

    const result = await updateTaskStatus({
      taskId,
      workspaceId: workspace.id,
      status,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Task was not updated.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/tasks`,
    );

    if (task.contactId) {
      revalidatePath(
        `/${locale}/dashboard/contacts/${task.contactId}`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to update task status:",
      error,
    );

    return {
      success: false,
      error: "Failed to update task status.",
    };
  }
}
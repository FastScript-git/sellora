"use server";

import { revalidatePath } from "next/cache";

import {
  deleteTaskSchema,
  type DeleteTaskInput,
} from "@/features/tasks/actions/task.schemas";
import {
  deleteTask,
  getTaskById,
} from "@/features/tasks/repositories/task.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type DeleteTaskResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function deleteTaskAction(
  input: DeleteTaskInput,
): Promise<DeleteTaskResult> {
  const parsedInput = deleteTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid task data.",
    };
  }

  const { taskId, locale } = parsedInput.data;

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

    const result = await deleteTask({
      taskId,
      workspaceId: workspace.id,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Task was not deleted.",
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
    console.error("Failed to delete task:", error);

    return {
      success: false,
      error: "Failed to delete task.",
    };
  }
}
import type { Prisma, TaskPriority } from "@/lib/generated/prisma/client";

import { createTask } from "@/features/tasks/repositories/task.repository";

import type {
  WorkflowActionDefinition,
  WorkflowActionResult,
  WorkflowRuntimeContext,
} from "../types";

type CreateTaskActionConfig = {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueInDays?: number;
  reminderInHours?: number;
  employeeId?: string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseCreateTaskConfig(
  config: Prisma.JsonValue | null,
): CreateTaskActionConfig {
  if (!isObject(config)) {
    return {};
  }

  return {
    title: typeof config.title === "string" ? config.title : undefined,
    description:
      typeof config.description === "string" || config.description === null
        ? config.description
        : undefined,
    priority:
      config.priority === "LOW" ||
      config.priority === "MEDIUM" ||
      config.priority === "HIGH" ||
      config.priority === "URGENT"
        ? config.priority
        : undefined,
    dueInDays:
      typeof config.dueInDays === "number" ? config.dueInDays : undefined,
    reminderInHours:
      typeof config.reminderInHours === "number"
        ? config.reminderInHours
        : undefined,
    employeeId:
      typeof config.employeeId === "string" || config.employeeId === null
        ? config.employeeId
        : undefined,
  };
}

export async function executeCreateTaskAction({
  action,
  context,
}: {
  action: WorkflowActionDefinition;
  context: WorkflowRuntimeContext;
}): Promise<WorkflowActionResult> {
  try {
    const config = parseCreateTaskConfig(action.config);

    const now = new Date();

    const dueAt =
      typeof config.dueInDays === "number"
        ? new Date(now.getTime() + config.dueInDays * 24 * 60 * 60 * 1000)
        : null;

    const reminderAt =
      typeof config.reminderInHours === "number"
        ? new Date(now.getTime() + config.reminderInHours * 60 * 60 * 1000)
        : null;

    const task = await createTask({
      workspaceId: context.workspaceId,
      title: config.title ?? "Workflow task",
      description: config.description,
      contactId: context.contactId ?? null,
      employeeId: config.employeeId ?? context.employeeId ?? null,
      priority: config.priority ?? "MEDIUM",
      dueAt,
      reminderAt,
    });

    return {
      actionId: action.id,
      type: action.type,
      success: true,
      output: {
        taskId: task.id,
        title: task.title,
      },
    };
  } catch (error) {
    return {
      actionId: action.id,
      type: action.type,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to execute CREATE_TASK action",
    };
  }
}

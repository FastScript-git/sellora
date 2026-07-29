import type {
  TaskPriority,
  TaskStatus,
} from "@/lib/generated/prisma/client";

import { z } from "zod";

export const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
] as const satisfies readonly TaskStatus[];

export const TASK_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const satisfies readonly TaskPriority[];

const optionalRelationIdSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value, context) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Invalid date.",
      });

      return z.NEVER;
    }

    return date;
  });

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(200, "Task title is too long."),

  description: optionalTextSchema,

  contactId: optionalRelationIdSchema,

  employeeId: optionalRelationIdSchema,

  priority: z.enum(TASK_PRIORITIES).default("MEDIUM"),

  dueAt: optionalDateSchema,

  reminderAt: optionalDateSchema,

  locale: z
    .string()
    .trim()
    .min(2)
    .max(10),
});

export const updateTaskStatusSchema = z.object({
  taskId: z
    .string()
    .trim()
    .min(1),

  status: z.enum(TASK_STATUSES),

  locale: z
    .string()
    .trim()
    .min(2)
    .max(10),
});

export const deleteTaskSchema = z.object({
  taskId: z
    .string()
    .trim()
    .min(1),

  locale: z
    .string()
    .trim()
    .min(2)
    .max(10),
});

export type CreateTaskInput = z.input<
  typeof createTaskSchema
>;

export type UpdateTaskStatusInput = z.input<
  typeof updateTaskStatusSchema
>;

export type DeleteTaskInput = z.input<
  typeof deleteTaskSchema
>;
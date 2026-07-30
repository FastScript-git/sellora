import type {
  Prisma,
  WorkflowExecutionStatus,
  WorkflowLogLevel,
} from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type CreateWorkflowExecutionParams = {
  workflowId: string;
  input?: Prisma.InputJsonValue;
};

export async function createWorkflowExecution({
  workflowId,
  input,
}: CreateWorkflowExecutionParams) {
  return prisma.workflowExecution.create({
    data: {
      workflowId,
      status: "PENDING",
      ...(input !== undefined ? { input } : {}),
    },
  });
}

type UpdateWorkflowExecutionParams = {
  executionId: string;
  status: WorkflowExecutionStatus;
  output?: Prisma.InputJsonValue;
  startedAt?: Date | null;
  finishedAt?: Date | null;
};

export async function updateWorkflowExecution({
  executionId,
  status,
  output,
  startedAt,
  finishedAt,
}: UpdateWorkflowExecutionParams) {
  return prisma.workflowExecution.update({
    where: {
      id: executionId,
    },
    data: {
      status,
      ...(output !== undefined ? { output } : {}),
      ...(startedAt !== undefined ? { startedAt } : {}),
      ...(finishedAt !== undefined ? { finishedAt } : {}),
    },
  });
}

type StartWorkflowExecutionParams = {
  executionId: string;
};

export async function startWorkflowExecution({
  executionId,
}: StartWorkflowExecutionParams) {
  return updateWorkflowExecution({
    executionId,
    status: "RUNNING",
    startedAt: new Date(),
  });
}

type CompleteWorkflowExecutionParams = {
  executionId: string;
  output?: Prisma.InputJsonValue;
};

export async function completeWorkflowExecution({
  executionId,
  output,
}: CompleteWorkflowExecutionParams) {
  return updateWorkflowExecution({
    executionId,
    status: "COMPLETED",
    output,
    finishedAt: new Date(),
  });
}

type FailWorkflowExecutionParams = {
  executionId: string;
  error: string;
  output?: Prisma.InputJsonValue;
};

export async function failWorkflowExecution({
  executionId,
  error,
  output,
}: FailWorkflowExecutionParams) {
  const failedOutput: Prisma.InputJsonObject = {
    error,
    ...(output !== undefined ? { output } : {}),
  };

  return updateWorkflowExecution({
    executionId,
    status: "FAILED",
    output: failedOutput,
    finishedAt: new Date(),
  });
}

type SkipWorkflowExecutionParams = {
  executionId: string;
  reason: string;
};

export async function skipWorkflowExecution({
  executionId,
  reason,
}: SkipWorkflowExecutionParams) {
  return updateWorkflowExecution({
    executionId,
    status: "SKIPPED",
    output: {
      reason,
    },
    finishedAt: new Date(),
  });
}

type CreateWorkflowExecutionLogParams = {
  executionId: string;
  level?: WorkflowLogLevel;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createWorkflowExecutionLog({
  executionId,
  level = "INFO",
  message,
  metadata,
}: CreateWorkflowExecutionLogParams) {
  return prisma.workflowExecutionLog.create({
    data: {
      executionId,
      level,
      message,
      ...(metadata !== undefined ? { metadata } : {}),
    },
  });
}

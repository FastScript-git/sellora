import type { WorkflowTriggerType } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type GetTriggeredWorkflowsParams = {
  workspaceId: string;
  triggerType: WorkflowTriggerType;
};

export async function getTriggeredWorkflows({
  workspaceId,
  triggerType,
}: GetTriggeredWorkflowsParams) {
  return prisma.workflow.findMany({
    where: {
      workspaceId,
      status: "ACTIVE",
      trigger: {
        is: {
          type: triggerType,
        },
      },
    },

    include: {
      trigger: true,

      workflowConditions: {
        orderBy: {
          position: "asc",
        },
      },

      workflowActions: {
        orderBy: {
          position: "asc",
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });
}

type GetWorkflowByExecutionParams = {
  executionId: string;
};

export async function getWorkflowByExecution({
  executionId,
}: GetWorkflowByExecutionParams) {
  return prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
    },

    include: {
      workflow: {
        include: {
          trigger: true,
          workflowConditions: {
            orderBy: {
              position: "asc",
            },
          },
          workflowActions: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },

      logs: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

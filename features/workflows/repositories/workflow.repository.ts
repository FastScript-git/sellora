import type {
  Prisma,
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowStatus,
  WorkflowTriggerType,
} from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type GetWorkflowsByWorkspaceParams = {
  workspaceId: string;
  status?: WorkflowStatus;
};

export async function getWorkflowsByWorkspace({
  workspaceId,
  status,
}: GetWorkflowsByWorkspaceParams) {
  return prisma.workflow.findMany({
    where: {
      workspaceId,
      ...(status ? { status } : {}),
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
      _count: {
        select: {
          executions: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

type GetWorkflowByIdParams = {
  workflowId: string;
  workspaceId: string;
};

export async function getWorkflowById({
  workflowId,
  workspaceId,
}: GetWorkflowByIdParams) {
  return prisma.workflow.findFirst({
    where: {
      id: workflowId,
      workspaceId,
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
      executions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          logs: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });
}

type CreateWorkflowConditionInput = {
  field: string;
  operator: WorkflowConditionOperator;
  value?: Prisma.InputJsonValue;
  position?: number;
};

type CreateWorkflowActionInput = {
  type: WorkflowActionType;
  config?: Prisma.InputJsonValue;
  position?: number;
};

type CreateWorkflowParams = {
  workspaceId: string;
  name: string;
  description?: string | null;
  status?: WorkflowStatus;
  trigger: {
    type: WorkflowTriggerType;
    config?: Prisma.InputJsonValue;
  };
  conditions?: CreateWorkflowConditionInput[];
  actions?: CreateWorkflowActionInput[];
};

export async function createWorkflow({
  workspaceId,
  name,
  description,
  status = "DRAFT",
  trigger,
  conditions = [],
  actions = [],
}: CreateWorkflowParams) {
  return prisma.workflow.create({
    data: {
      workspaceId,
      name,
      description,
      status,
      trigger: {
        create: {
          type: trigger.type,
          ...(trigger.config !== undefined
            ? { config: trigger.config }
            : {}),
        },
      },
      workflowConditions: {
        create: conditions.map((condition, index) => ({
          field: condition.field,
          operator: condition.operator,
          ...(condition.value !== undefined
            ? { value: condition.value }
            : {}),
          position: condition.position ?? index,
        })),
      },
      workflowActions: {
        create: actions.map((action, index) => ({
          type: action.type,
          ...(action.config !== undefined
            ? { config: action.config }
            : {}),
          position: action.position ?? index,
        })),
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
  });
}

type UpdateWorkflowDetailsParams = {
  workflowId: string;
  workspaceId: string;
  name?: string;
  description?: string | null;
};

export async function updateWorkflowDetails({
  workflowId,
  workspaceId,
  name,
  description,
}: UpdateWorkflowDetailsParams) {
  return prisma.workflow.updateMany({
    where: {
      id: workflowId,
      workspaceId,
    },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });
}

type UpdateWorkflowStatusParams = {
  workflowId: string;
  workspaceId: string;
  status: WorkflowStatus;
};

export async function updateWorkflowStatus({
  workflowId,
  workspaceId,
  status,
}: UpdateWorkflowStatusParams) {
  return prisma.workflow.updateMany({
    where: {
      id: workflowId,
      workspaceId,
    },
    data: {
      status,
    },
  });
}

type DeleteWorkflowParams = {
  workflowId: string;
  workspaceId: string;
};

export async function deleteWorkflow({
  workflowId,
  workspaceId,
}: DeleteWorkflowParams) {
  return prisma.workflow.deleteMany({
    where: {
      id: workflowId,
      workspaceId,
    },
  });
}

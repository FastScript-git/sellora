import {
  Prisma,
  type WorkflowActionType,
  type WorkflowConditionOperator,
  type WorkflowStatus,
  type WorkflowTriggerType,
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

type WorkflowConditionInput = {
  field: string;
  operator: WorkflowConditionOperator;
  value?: Prisma.InputJsonValue;
  position?: number;
};

type WorkflowActionInput = {
  type: WorkflowActionType;
  config?: Prisma.InputJsonValue;
  position?: number;
};

type WorkflowTriggerInput = {
  type: WorkflowTriggerType;
  config?: Prisma.InputJsonValue;
};

type CreateWorkflowParams = {
  workspaceId: string;
  name: string;
  description?: string | null;
  status?: WorkflowStatus;
  trigger: WorkflowTriggerInput;
  conditions?: WorkflowConditionInput[];
  actions?: WorkflowActionInput[];
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

type ReplaceWorkflowDefinitionParams = {
  workflowId: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
  trigger: WorkflowTriggerInput;
  conditions: WorkflowConditionInput[];
  actions: WorkflowActionInput[];
};

export async function replaceWorkflowDefinition({
  workflowId,
  workspaceId,
  name,
  description,
  status,
  trigger,
  conditions,
  actions,
}: ReplaceWorkflowDefinitionParams) {
  return prisma.$transaction(async (transaction) => {
    const existingWorkflow =
      await transaction.workflow.findFirst({
        where: {
          id: workflowId,
          workspaceId,
        },
        select: {
          id: true,
        },
      });

    if (!existingWorkflow) {
      return null;
    }

    await transaction.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        name,
        description,
        status,
      },
    });

    await transaction.workflowTrigger.upsert({
      where: {
        workflowId,
      },
      update: {
        type: trigger.type,
         ...(trigger.config !== undefined
         ? { config: trigger.config }
         : { config: Prisma.DbNull }),
      },
      create: {
        workflowId,
        type: trigger.type,
        ...(trigger.config !== undefined
          ? { config: trigger.config }
          : {}),
      },
    });

    await transaction.workflowCondition.deleteMany({
      where: {
        workflowId,
      },
    });

    if (conditions.length > 0) {
      await transaction.workflowCondition.createMany({
        data: conditions.map((condition, index) => ({
          workflowId,
          field: condition.field,
          operator: condition.operator,
          ...(condition.value !== undefined
            ? { value: condition.value }
            : {}),
          position: condition.position ?? index,
        })),
      });
    }

    await transaction.workflowAction.deleteMany({
      where: {
        workflowId,
      },
    });

    if (actions.length > 0) {
      await transaction.workflowAction.createMany({
        data: actions.map((action, index) => ({
          workflowId,
          type: action.type,
          ...(action.config !== undefined
            ? { config: action.config }
            : {}),
          position: action.position ?? index,
        })),
      });
    }

    return transaction.workflow.findUnique({
      where: {
        id: workflowId,
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

type DuplicateWorkflowParams = {
  workflowId: string;
  workspaceId: string;
};

export async function duplicateWorkflow({
  workflowId,
  workspaceId,
}: DuplicateWorkflowParams) {
  return prisma.$transaction(async (transaction) => {
    const sourceWorkflow =
      await transaction.workflow.findFirst({
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
        },
      });

    if (!sourceWorkflow || !sourceWorkflow.trigger) {
      return null;
    }

    return transaction.workflow.create({
      data: {
        workspaceId,
        name: `${sourceWorkflow.name} (Copy)`,
        description: sourceWorkflow.description,
        status: "DRAFT",

        trigger: {
          create: {
            type: sourceWorkflow.trigger.type,
            ...(sourceWorkflow.trigger.config !== null
              ? {
                  config:
                    sourceWorkflow.trigger.config,
                }
              : {}),
          },
        },

        workflowConditions: {
          create: sourceWorkflow.workflowConditions.map(
            (condition, index) => ({
              field: condition.field,
              operator: condition.operator,
              ...(condition.value !== null
                ? {
                    value: condition.value,
                  }
                : {}),
              position: condition.position ?? index,
            }),
          ),
        },

        workflowActions: {
          create: sourceWorkflow.workflowActions.map(
            (action, index) => ({
              type: action.type,
              ...(action.config !== null
                ? {
                    config: action.config,
                  }
                : {}),
              position: action.position ?? index,
            }),
          ),
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
  });
}

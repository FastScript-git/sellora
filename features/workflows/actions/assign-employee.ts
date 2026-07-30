import type { Prisma } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  WorkflowActionDefinition,
  WorkflowActionResult,
  WorkflowRuntimeContext,
} from "../types";

type AssignEmployeeActionConfig = {
  employeeId?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseAssignEmployeeConfig(
  config: Prisma.JsonValue | null,
): AssignEmployeeActionConfig {
  if (!isObject(config)) {
    return {};
  }

  return {
    employeeId:
      typeof config.employeeId === "string" &&
      config.employeeId.trim().length > 0
        ? config.employeeId.trim()
        : undefined,
  };
}

export async function executeAssignEmployeeAction({
  action,
  context,
}: {
  action: WorkflowActionDefinition;
  context: WorkflowRuntimeContext;
}): Promise<WorkflowActionResult> {
  try {
    const config = parseAssignEmployeeConfig(action.config);

    if (!config.employeeId) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "ASSIGN_EMPLOYEE action requires employeeId",
      };
    }

    const employee = await prisma.aIEmployee.findFirst({
      where: {
        id: config.employeeId,
        workspaceId: context.workspaceId,
        status: {
          not: "ARCHIVED",
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!employee) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "AI employee not found in this workspace",
      };
    }

    if (context.conversationId) {
      const result = await prisma.conversation.updateMany({
        where: {
          id: context.conversationId,
          employee: {
            workspaceId: context.workspaceId,
          },
        },
        data: {
          employeeId: employee.id,
        },
      });

      if (result.count === 0) {
        return {
          actionId: action.id,
          type: action.type,
          success: false,
          error: "Conversation not found in this workspace",
        };
      }

      return {
        actionId: action.id,
        type: action.type,
        success: true,
        output: {
          employeeId: employee.id,
          employeeName: employee.name,
          conversationId: context.conversationId,
          updatedConversations: result.count,
        },
      };
    }

    if (context.contactId) {
      const result = await prisma.conversation.updateMany({
        where: {
          contactId: context.contactId,
          status: "OPEN",
          contact: {
            workspaceId: context.workspaceId,
          },
        },
        data: {
          employeeId: employee.id,
        },
      });

      if (result.count === 0) {
        return {
          actionId: action.id,
          type: action.type,
          success: false,
          error: "No open conversations found for this contact",
        };
      }

      return {
        actionId: action.id,
        type: action.type,
        success: true,
        output: {
          employeeId: employee.id,
          employeeName: employee.name,
          contactId: context.contactId,
          updatedConversations: result.count,
        },
      };
    }

    return {
      actionId: action.id,
      type: action.type,
      success: false,
      error: "ASSIGN_EMPLOYEE action requires conversationId or contactId",
    };
  } catch (error) {
    return {
      actionId: action.id,
      type: action.type,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to execute ASSIGN_EMPLOYEE action",
    };
  }
}

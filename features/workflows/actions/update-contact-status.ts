import type {
  ContactStatus,
  Prisma,
} from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  WorkflowActionDefinition,
  WorkflowActionResult,
  WorkflowRuntimeContext,
} from "../types";

type UpdateContactStatusActionConfig = {
  status?: ContactStatus;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseUpdateContactStatusConfig(
  config: Prisma.JsonValue | null,
): UpdateContactStatusActionConfig {
  if (!isObject(config)) {
    return {};
  }

  const status = config.status;

  if (
    status === "LEAD" ||
    status === "QUALIFIED" ||
    status === "CUSTOMER" ||
    status === "CLOSED"
  ) {
    return {
      status,
    };
  }

  return {};
}

export async function executeUpdateContactStatusAction({
  action,
  context,
}: {
  action: WorkflowActionDefinition;
  context: WorkflowRuntimeContext;
}): Promise<WorkflowActionResult> {
  try {
    if (!context.contactId) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "UPDATE_CONTACT_STATUS action requires contactId",
      };
    }

    const config = parseUpdateContactStatusConfig(action.config);

    if (!config.status) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "UPDATE_CONTACT_STATUS action requires a valid status",
      };
    }

    const result = await prisma.contact.updateMany({
      where: {
        id: context.contactId,
        workspaceId: context.workspaceId,
      },
      data: {
        status: config.status,
      },
    });

    if (result.count === 0) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "Contact not found",
      };
    }

    return {
      actionId: action.id,
      type: action.type,
      success: true,
      output: {
        contactId: context.contactId,
        status: config.status,
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
          : "Failed to execute UPDATE_CONTACT_STATUS action",
    };
  }
}

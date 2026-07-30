import type { Prisma } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  WorkflowActionDefinition,
  WorkflowActionResult,
  WorkflowRuntimeContext,
} from "../types";

type AddTagActionConfig = {
  tag?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseAddTagConfig(
  config: Prisma.JsonValue | null,
): AddTagActionConfig {
  if (!isObject(config)) {
    return {};
  }

  return {
    tag:
      typeof config.tag === "string" && config.tag.trim().length > 0
        ? config.tag.trim()
        : undefined,
  };
}

function parseExistingTags(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

export async function executeAddTagAction({
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
        error: "ADD_TAG action requires contactId",
      };
    }

    const config = parseAddTagConfig(action.config);

    if (!config.tag) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "ADD_TAG action requires a non-empty tag",
      };
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: context.contactId,
        workspaceId: context.workspaceId,
      },
      select: {
        id: true,
        tags: true,
      },
    });

    if (!contact) {
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "Contact not found",
      };
    }

    const existingTags = parseExistingTags(contact.tags);
    const alreadyExists = existingTags.some(
      (tag) => tag.toLowerCase() === config.tag?.toLowerCase(),
    );

    const tags = alreadyExists
      ? existingTags
      : [...existingTags, config.tag];

    await prisma.contact.update({
      where: {
        id: contact.id,
      },
      data: {
        tags,
      },
    });

    return {
      actionId: action.id,
      type: action.type,
      success: true,
      output: {
        contactId: contact.id,
        tag: config.tag,
        added: !alreadyExists,
        tags,
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
          : "Failed to execute ADD_TAG action",
    };
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteWorkflow,
  getWorkflowById,
  replaceWorkflowDefinition,
  updateWorkflowDetails,
  updateWorkflowStatus,
} from "@/features/workflows/repositories/workflow.repository";
import {
  Prisma,
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowStatus,
  WorkflowTriggerType,
} from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkflowRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

const workflowStatusSchema = z.nativeEnum(WorkflowStatus);

const workflowTriggerTypeSchema = z.nativeEnum(
  WorkflowTriggerType,
);

const workflowConditionOperatorSchema = z.nativeEnum(
  WorkflowConditionOperator,
);

const workflowActionTypeSchema = z.nativeEnum(
  WorkflowActionType,
);

const workflowTriggerSchema = z.object({
  type: workflowTriggerTypeSchema,
  config: z.unknown().optional(),
});

const workflowConditionSchema = z.object({
  field: z
    .string()
    .trim()
    .min(1, "Condition field is required.")
    .max(
      120,
      "Condition field must not exceed 120 characters.",
    ),

  operator: workflowConditionOperatorSchema,

  value: z.unknown().optional(),

  position: z
    .number()
    .int()
    .nonnegative()
    .optional(),
});

const workflowActionSchema = z.object({
  type: workflowActionTypeSchema,

  config: z.unknown().optional(),

  position: z
    .number()
    .int()
    .nonnegative()
    .optional(),
});

const updateWorkflowSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Workflow name must contain at least 2 characters.",
      )
      .max(
        120,
        "Workflow name must not exceed 120 characters.",
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Workflow description must not exceed 500 characters.",
      )
      .nullable()
      .optional(),

    status: workflowStatusSchema.optional(),

    trigger: workflowTriggerSchema.optional(),

    conditions: z
      .array(workflowConditionSchema)
      .optional(),

    actions: z
      .array(workflowActionSchema)
      .min(
        1,
        "At least one workflow action is required.",
      )
      .optional(),
  })
  .superRefine((value, context) => {
    const hasAnyField =
      value.name !== undefined ||
      value.description !== undefined ||
      value.status !== undefined ||
      value.trigger !== undefined ||
      value.conditions !== undefined ||
      value.actions !== undefined;

    if (!hasAnyField) {
      context.addIssue({
        code: "custom",
        message:
          "At least one workflow field must be provided.",
      });

      return;
    }

    const isDefinitionUpdate =
      value.trigger !== undefined ||
      value.conditions !== undefined ||
      value.actions !== undefined;

    if (!isDefinitionUpdate) {
      return;
    }

    if (value.name === undefined) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message:
          "Workflow name is required when updating the definition.",
      });
    }

    if (value.status === undefined) {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message:
          "Workflow status is required when updating the definition.",
      });
    }

    if (value.trigger === undefined) {
      context.addIssue({
        code: "custom",
        path: ["trigger"],
        message:
          "Workflow trigger is required when updating the definition.",
      });
    }

    if (value.conditions === undefined) {
      context.addIssue({
        code: "custom",
        path: ["conditions"],
        message:
          "Workflow conditions are required when updating the definition.",
      });
    }

    if (value.actions === undefined) {
      context.addIssue({
        code: "custom",
        path: ["actions"],
        message:
          "Workflow actions are required when updating the definition.",
      });
    }
  });

function validateWorkflowId(workflowId: string): boolean {
  return workflowId.trim().length > 0;
}

function isJsonValue(
  value: unknown,
): value is Prisma.InputJsonValue {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.values(
      value as Record<string, unknown>,
    ).every(isJsonValue);
  }

  return false;
}

export async function GET(
  _request: Request,
  context: WorkflowRouteContext,
): Promise<NextResponse> {
  try {
    const { workflowId } = await context.params;

    if (!validateWorkflowId(workflowId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const workspace = await getCurrentWorkspace();

    const workflow = await getWorkflowById({
      workflowId,
      workspaceId: workspace.id,
    });

    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow was not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    console.error("Failed to get workflow:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get workflow.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  context: WorkflowRouteContext,
): Promise<NextResponse> {
  try {
    const { workflowId } = await context.params;

    if (!validateWorkflowId(workflowId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const parsedBody = updateWorkflowSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid workflow data.",
          fieldErrors:
            parsedBody.error.flatten().fieldErrors,
          formErrors:
            parsedBody.error.flatten().formErrors,
        },
        {
          status: 400,
        },
      );
    }

    const workspace = await getCurrentWorkspace();

    const existingWorkflow = await getWorkflowById({
      workflowId,
      workspaceId: workspace.id,
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow was not found.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      name,
      description,
      status,
      trigger,
      conditions,
      actions,
    } = parsedBody.data;

    const isDefinitionUpdate =
      trigger !== undefined ||
      conditions !== undefined ||
      actions !== undefined;

    if (isDefinitionUpdate) {
      if (
        name === undefined ||
        status === undefined ||
        trigger === undefined ||
        conditions === undefined ||
        actions === undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Complete workflow definition is required.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        trigger.config !== undefined &&
        trigger.config !== null &&
        !isJsonValue(trigger.config)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Trigger config must be valid JSON.",
          },
          {
            status: 400,
          },
        );
      }

      for (const condition of conditions) {
        if (
          condition.value !== undefined &&
          condition.value !== null &&
          !isJsonValue(condition.value)
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Condition value must be valid JSON.",
            },
            {
              status: 400,
            },
          );
        }
      }

      for (const action of actions) {
        if (
          action.config !== undefined &&
          action.config !== null &&
          !isJsonValue(action.config)
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Action config must be valid JSON.",
            },
            {
              status: 400,
            },
          );
        }
      }

      const workflow = await replaceWorkflowDefinition({
        workflowId,
        workspaceId: workspace.id,
        name,
        description,
        status,
        trigger: {
          type: trigger.type,
          ...(trigger.config !== undefined &&
          trigger.config !== null &&
          isJsonValue(trigger.config)
            ? {
                config: trigger.config,
              }
            : {}),
        },
        conditions: conditions.map(
          (condition, index) => {
            const value =
              condition.value !== undefined &&
              condition.value !== null &&
              isJsonValue(condition.value)
                ? condition.value
                : undefined;

            return {
              field: condition.field,
              operator: condition.operator,
              ...(value !== undefined
                ? {
                    value,
                  }
                : {}),
              position:
                condition.position ?? index,
            };
          },
        ),
        actions: actions.map((action, index) => {
          const config =
            action.config !== undefined &&
            action.config !== null &&
            isJsonValue(action.config)
              ? action.config
              : undefined;

          return {
            type: action.type,
            ...(config !== undefined
              ? {
                  config,
                }
              : {}),
            position: action.position ?? index,
          };
        }),
      });

      if (!workflow) {
        return NextResponse.json(
          {
            success: false,
            error: "Workflow was not found.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        success: true,
        workflow,
      });
    }

    if (
      name !== undefined ||
      description !== undefined
    ) {
      await updateWorkflowDetails({
        workflowId,
        workspaceId: workspace.id,
        name,
        description,
      });
    }

    if (status !== undefined) {
      await updateWorkflowStatus({
        workflowId,
        workspaceId: workspace.id,
        status,
      });
    }

    const workflow = await getWorkflowById({
      workflowId,
      workspaceId: workspace.id,
    });

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    console.error("Failed to update workflow:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update workflow.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: WorkflowRouteContext,
): Promise<NextResponse> {
  try {
    const { workflowId } = await context.params;

    if (!validateWorkflowId(workflowId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const workspace = await getCurrentWorkspace();

    const existingWorkflow = await getWorkflowById({
      workflowId,
      workspaceId: workspace.id,
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow was not found.",
        },
        {
          status: 404,
        },
      );
    }

    await deleteWorkflow({
      workflowId,
      workspaceId: workspace.id,
    });

    return NextResponse.json({
      success: true,
      deletedWorkflowId: workflowId,
    });
  } catch (error) {
    console.error("Failed to delete workflow:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete workflow.",
      },
      {
        status: 500,
      },
    );
  }
}

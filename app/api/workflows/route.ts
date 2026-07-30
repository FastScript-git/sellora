import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createWorkflow,
  getWorkflowsByWorkspace,
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

const createWorkflowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workflow name must contain at least 2 characters.")
    .max(120, "Workflow name must not exceed 120 characters."),

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

  trigger: z.object({
    type: workflowTriggerTypeSchema,
    config: z.unknown().optional(),
  }),

  conditions: z
    .array(
      z.object({
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
      }),
    )
    .optional(),

  actions: z
    .array(
      z.object({
        type: workflowActionTypeSchema,

        config: z.unknown().optional(),

        position: z
          .number()
          .int()
          .nonnegative()
          .optional(),
      }),
    )
    .min(1, "At least one workflow action is required.")
    .optional(),
});

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
  request: Request,
): Promise<NextResponse> {
  try {
    const workspace = await getCurrentWorkspace();

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");

    let status: WorkflowStatus | undefined;

    if (statusParam) {
      const parsedStatus =
        workflowStatusSchema.safeParse(statusParam);

      if (!parsedStatus.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid workflow status.",
          },
          {
            status: 400,
          },
        );
      }

      status = parsedStatus.data;
    }

    const workflows = await getWorkflowsByWorkspace({
      workspaceId: workspace.id,
      status,
    });

    return NextResponse.json({
      success: true,
      workflows,
    });
  } catch (error) {
    console.error("Failed to get workflows:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get workflows.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
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

    const parsedBody = createWorkflowSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid workflow data.",
          fieldErrors:
            parsedBody.error.flatten().fieldErrors,
        },
        {
          status: 400,
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

    if (
      trigger.config !== undefined &&
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

    for (const condition of conditions ?? []) {
      if (
        condition.value !== undefined &&
        !isJsonValue(condition.value)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Condition value must be valid JSON.",
          },
          {
            status: 400,
          },
        );
      }
    }

    for (const action of actions ?? []) {
      if (
        action.config !== undefined &&
        !isJsonValue(action.config)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Action config must be valid JSON.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const workspace = await getCurrentWorkspace();

    const workflow = await createWorkflow({
      workspaceId: workspace.id,
      name,
      description,
      status,
      trigger: {
        type: trigger.type,
        ...(trigger.config !== undefined
          ? { config: trigger.config }
          : {}),
      },
      conditions: conditions?.map((condition) => {
  const value =
    condition.value !== undefined &&
    isJsonValue(condition.value)
      ? condition.value
      : undefined;

  return {
    field: condition.field,
    operator: condition.operator,
    ...(value !== undefined ? { value } : {}),
    ...(condition.position !== undefined
      ? { position: condition.position }
      : {}),
  };
}),
actions: actions?.map((action) => {
  const config =
    action.config !== undefined &&
    isJsonValue(action.config)
      ? action.config
      : undefined;

  return {
    type: action.type,
    ...(config !== undefined ? { config } : {}),
    ...(action.position !== undefined
      ? { position: action.position }
      : {}),
  };
  }),
    });

    return NextResponse.json(
      {
        success: true,
        workflow,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Failed to create workflow:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create workflow.",
      },
      {
        status: 500,
      },
    );
  }
}

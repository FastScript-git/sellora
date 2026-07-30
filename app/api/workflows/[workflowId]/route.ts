import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteWorkflow,
  getWorkflowById,
  updateWorkflowDetails,
  updateWorkflowStatus,
} from "@/features/workflows/repositories/workflow.repository";
import { WorkflowStatus } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkflowRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

const updateWorkflowSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Workflow name must contain at least 2 characters.")
      .max(120, "Workflow name must not exceed 120 characters.")
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

    status: z.nativeEnum(WorkflowStatus).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.status !== undefined,
    {
      message: "At least one workflow field must be provided.",
    },
  );

function validateWorkflowId(workflowId: string) {
  return workflowId.trim().length > 0;
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

    const { name, description, status } = parsedBody.data;

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

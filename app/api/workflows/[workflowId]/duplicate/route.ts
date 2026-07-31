import { NextResponse } from "next/server";

import { duplicateWorkflow } from "@/features/workflows/repositories/workflow.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DuplicateWorkflowRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: DuplicateWorkflowRouteContext,
): Promise<NextResponse> {
  try {
    const { workflowId } = await context.params;

    if (!workflowId.trim()) {
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

    const workflow = await duplicateWorkflow({
      workflowId,
      workspaceId: workspace.id,
    });

    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Workflow was not found or has no trigger.",
        },
        {
          status: 404,
        },
      );
    }

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
    console.error(
      "Failed to duplicate workflow:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to duplicate workflow.",
      },
      {
        status: 500,
      },
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { runWorkflowById } from "@/features/workflows/services/workflow-engine";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkflowRunRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

const runWorkflowSchema = z.object({
  contactId: z.string().trim().min(1).optional(),
  conversationId: z.string().trim().min(1).optional(),
  messageId: z.string().trim().min(1).optional(),
  taskId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(
  request: Request,
  context: WorkflowRunRouteContext,
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

    let body: unknown = {};

    const requestBody = await request.text();

    if (requestBody.trim()) {
      try {
        body = JSON.parse(requestBody);
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
    }

    const parsedBody = runWorkflowSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid workflow execution data.",
          fieldErrors: parsedBody.error.flatten().fieldErrors,
          formErrors: parsedBody.error.flatten().formErrors,
        },
        {
          status: 400,
        },
      );
    }

    const workspace = await getCurrentWorkspace();

    const result = await runWorkflowById({
      workflowId,
      workspaceId: workspace.id,
      contactId: parsedBody.data.contactId,
      conversationId: parsedBody.data.conversationId,
      messageId: parsedBody.data.messageId,
      taskId: parsedBody.data.taskId,
      employeeId: parsedBody.data.employeeId,
      payload: parsedBody.data.payload,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow was not found or has no trigger.",
        },
        {
          status: 404,
        },
      );
    }

    if (result.status === "FAILED") {
      return NextResponse.json(
        {
          success: false,
          result,
          error: result.error ?? "Workflow execution failed.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Failed to run workflow:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to run workflow.",
      },
      {
        status: 500,
      },
    );
  }
}

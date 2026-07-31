import { NextResponse } from "next/server";
import { z } from "zod";

import { createWorkspaceConversationMessage } from "@/features/conversations/repositories/conversation-message.repository";
import { ConversationRole } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConversationMessagesRouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(
      10000,
      "Message must not exceed 10,000 characters.",
    ),
});

export async function POST(
  request: Request,
  context: ConversationMessagesRouteContext,
): Promise<NextResponse> {
  try {
    const { conversationId } = await context.params;

    if (!conversationId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required.",
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

    const parsedBody = createMessageSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid message data.",
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

    const message =
      await createWorkspaceConversationMessage({
        workspaceId: workspace.id,
        conversationId,
        role: ConversationRole.ASSISTANT,
        content: parsedBody.data.content,
        metadata: {
          source: "DASHBOARD",
        },
      });

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation was not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Failed to create conversation message:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message.",
      },
      {
        status: 500,
      },
    );
  }
}

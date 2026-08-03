import { NextResponse } from "next/server";

import { validateWidgetRequest } from "@/features/channels/services/validate-widget-request";
import type {
  Prisma,
  WidgetEventType,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    widgetKey: string;
  }>;
};

type WidgetEventBody = {
  type?: string;
  visitorId?: string;
  sessionId?: string;
  pageUrl?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
};

const ALLOWED_EVENT_TYPES = [
  "VIEW",
  "OPEN",
  "CONVERSATION_STARTED",
  "USER_MESSAGE",
  "AI_RESPONSE",
] as const satisfies readonly WidgetEventType[];

function getCorsHeaders(request?: Request) {
  const origin = request?.headers.get("origin");

  return {
    "Access-Control-Allow-Origin":
      origin && origin !== "null"
        ? origin
        : "*",
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  request?: Request,
) {
  return NextResponse.json(body, {
    status,
    headers: getCorsHeaders(request),
  });
}

function normalizeOptionalText(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, maxLength);
}

function isAllowedEventType(
  value: unknown,
): value is (typeof ALLOWED_EVENT_TYPES)[number] {
  return (
    typeof value === "string" &&
    ALLOWED_EVENT_TYPES.includes(
      value as (typeof ALLOWED_EVENT_TYPES)[number],
    )
  );
}

export async function OPTIONS(
  request: Request,
) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const { widgetKey } = await context.params;

  const normalizedWidgetKey =
    widgetKey.trim();

  if (!normalizedWidgetKey) {
    return jsonResponse(
      {
        success: false,
        error: "Widget key is required.",
      },
      400,
      request,
    );
  }

  let body: WidgetEventBody;

  try {
    body =
      (await request.json()) as WidgetEventBody;
  } catch {
    return jsonResponse(
      {
        success: false,
        error:
          "Request body must be valid JSON.",
      },
      400,
      request,
    );
  }

  if (!isAllowedEventType(body.type)) {
    return jsonResponse(
      {
        success: false,
        error:
          "Unsupported widget event type.",
      },
      400,
      request,
    );
  }

  try {
    const validation =
      await validateWidgetRequest({
        request,
        widgetKey: normalizedWidgetKey,
      });

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          error: validation.error,
          code: validation.code,
        },
        validation.status,
        request,
      );
    }

    const event =
      await prisma.widgetEvent.create({
        data: {
          workspaceId:
            validation.channel.employee
              .workspaceId,

          channelId:
            validation.channel.id,

          type: body.type,

          visitorId: normalizeOptionalText(
            body.visitorId,
            200,
          ),

          sessionId: normalizeOptionalText(
            body.sessionId,
            200,
          ),

          pageUrl: normalizeOptionalText(
            body.pageUrl,
            2_000,
          ),

          referrer: normalizeOptionalText(
            body.referrer,
            2_000,
          ),

          metadata:
            body.metadata &&
            typeof body.metadata === "object" &&
            !Array.isArray(body.metadata)
              ? (body.metadata as Prisma.InputJsonValue)
              : undefined,
        },

        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      });

    return jsonResponse(
      {
        success: true,
        data: event,
      },
      201,
      request,
    );
  } catch (error) {
    console.error(
      "Failed to record widget event:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          "An unexpected error occurred while recording the widget event.",
      },
      500,
      request,
    );
  }
}

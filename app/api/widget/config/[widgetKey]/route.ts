import { NextResponse } from "next/server";

import { isWidgetRequestAllowed } from "@/features/channels/services/widget-domain-access";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WidgetConfigRouteProps = {
  params: Promise<{
    widgetKey: string;
  }>;
};

function getCorsHeaders(
  request?: Request,
) {
  const origin =
    request?.headers.get("origin");

  return {
    "Access-Control-Allow-Origin":
      origin && origin !== "null"
        ? origin
        : "*",

    "Access-Control-Allow-Methods":
      "GET, OPTIONS",

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

export async function OPTIONS(
  request: Request,
) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(
  request: Request,
  { params }: WidgetConfigRouteProps,
) {
  const { widgetKey } = await params;

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

  try {
    const channel =
      await prisma.channel.findUnique({
        where: {
          widgetKey: normalizedWidgetKey,
        },

        select: {
          id: true,
          name: true,
          isEnabled: true,
          type: true,
          allowedDomains: true,
          widgetTitle: true,
          widgetGreeting: true,
          widgetPrimaryColor: true,
          widgetPosition: true,

          employee: {
            select: {
              id: true,
              name: true,
              role: true,
              description: true,
              language: true,
              status: true,
            },
          },
        },
      });

    if (
      !channel ||
      channel.type !== "WEBSITE" ||
      !channel.isEnabled ||
      channel.employee.status !== "ACTIVE"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Widget was not found or is unavailable.",
        },
        404,
        request,
      );
    }

    const domainAccess =
      isWidgetRequestAllowed({
        request,
        allowedDomains:
          channel.allowedDomains,
      });

    if (!domainAccess.allowed) {
      console.warn(
        "Blocked widget configuration request:",
        {
          channelId: channel.id,
          hostname:
            domainAccess.hostname,
          reason: domainAccess.reason,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "This widget is not allowed on the current domain.",
        },
        403,
        request,
      );
    }

    return jsonResponse(
      {
        success: true,

        widget: {
          channelId: channel.id,
          name: channel.name,

          title:
            channel.widgetTitle?.trim() ||
            channel.employee.name,

          greeting:
            channel.widgetGreeting?.trim() ||
            `Hello! I’m ${channel.employee.name}. How can I help you today?`,

          primaryColor:
            channel.widgetPrimaryColor ||
            "#2563eb",

          position:
            channel.widgetPosition ===
            "bottom-left"
              ? "bottom-left"
              : "bottom-right",

          employee: {
            id: channel.employee.id,
            name: channel.employee.name,
            role: channel.employee.role,
            description:
              channel.employee.description,
            language:
              channel.employee.language,
          },
        },
      },
      200,
      request,
    );
  } catch (error) {
    console.error(
      "Widget configuration request failed:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Unable to load widget configuration.",
      },
      500,
      request,
    );
  }
}

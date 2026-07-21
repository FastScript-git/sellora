import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WidgetConfigRouteProps = {
  params: Promise<{
    widgetKey: string;
  }>;
};

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: getCorsHeaders(),
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function GET(
  _request: Request,
  { params }: WidgetConfigRouteProps,
) {
  const { widgetKey } = await params;
  const normalizedWidgetKey = widgetKey.trim();

  if (!normalizedWidgetKey) {
    return jsonResponse(
      {
        success: false,
        error: "Widget key is required.",
      },
      400,
    );
  }

  try {
    const channel = await prisma.channel.findUnique({
      where: {
        widgetKey: normalizedWidgetKey,
      },
      select: {
        id: true,
        name: true,
        isEnabled: true,
        type: true,
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
          error: "Widget was not found or is unavailable.",
        },
        404,
      );
    }

    return jsonResponse({
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
          channel.widgetPrimaryColor || "#2563eb",
        position:
          channel.widgetPosition === "bottom-left"
            ? "bottom-left"
            : "bottom-right",
        employee: {
          id: channel.employee.id,
          name: channel.employee.name,
          role: channel.employee.role,
          description: channel.employee.description,
          language: channel.employee.language,
        },
      },
    });
  } catch (error) {
    console.error(
      "Widget configuration request failed:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error: "Unable to load widget configuration.",
      },
      500,
    );
  }
}
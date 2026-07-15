import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WidgetConfigRouteProps = {
  params: Promise<{
    widgetKey: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: WidgetConfigRouteProps,
) {
  const { widgetKey } = await params;
  const normalizedWidgetKey = widgetKey.trim();

  if (!normalizedWidgetKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Widget key is required.",
      },
      {
        status: 400,
      },
    );
  }

  const channel = await prisma.channel.findUnique({
    where: {
      widgetKey: normalizedWidgetKey,
    },
    select: {
      id: true,
      name: true,
      isEnabled: true,
      type: true,
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
    return NextResponse.json(
      {
        success: false,
        error: "Widget was not found or is unavailable.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    success: true,
    widget: {
      channelId: channel.id,
      name: channel.name,
      employee: {
        id: channel.employee.id,
        name: channel.employee.name,
        role: channel.employee.role,
        description: channel.employee.description,
        language: channel.employee.language,
      },
    },
  });
}
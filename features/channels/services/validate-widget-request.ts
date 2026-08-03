import { isWidgetRequestAllowed } from "@/features/channels/services/widget-domain-access";
import { prisma } from "@/lib/prisma";

type ValidateWidgetRequestParams = {
  request: Request;
  widgetKey: string;
};

type WidgetValidationErrorCode =
  | "WIDGET_KEY_REQUIRED"
  | "WIDGET_UNAVAILABLE"
  | "DOMAIN_NOT_ALLOWED";

type WidgetValidationFailure = {
  success: false;
  status: 400 | 403 | 404;
  code: WidgetValidationErrorCode;
  error: string;
};

type WidgetValidationSuccess = {
  success: true;

  channel: {
    id: string;
    name: string;
    widgetKey: string;
    isEnabled: boolean;
    allowedDomains: string[];

    widgetTitle: string | null;
    widgetGreeting: string | null;
    widgetPrimaryColor: string | null;
    widgetPosition: string | null;

    employee: {
      id: string;
      workspaceId: string;
      name: string;
      role: string;
      description: string | null;
      language: string;
      tone: string | null;
      identity: string | null;
      goals: string | null;
      rules: string | null;
      responseStyle: string | null;
      restrictions: string | null;
      status: string;
    };
  };

  hostname: string | null;
};

export type ValidateWidgetRequestResult =
  | WidgetValidationSuccess
  | WidgetValidationFailure;

export async function validateWidgetRequest({
  request,
  widgetKey,
}: ValidateWidgetRequestParams): Promise<ValidateWidgetRequestResult> {
  const normalizedWidgetKey =
    widgetKey.trim();

  if (!normalizedWidgetKey) {
    return {
      success: false,
      status: 400,
      code: "WIDGET_KEY_REQUIRED",
      error: "Widget key is required.",
    };
  }

  const channel =
    await prisma.channel.findUnique({
      where: {
        widgetKey: normalizedWidgetKey,
      },

      select: {
        id: true,
        name: true,
        widgetKey: true,
        type: true,
        isEnabled: true,
        allowedDomains: true,

        widgetTitle: true,
        widgetGreeting: true,
        widgetPrimaryColor: true,
        widgetPosition: true,

        employee: {
          select: {
            id: true,
            workspaceId: true,
            name: true,
            role: true,
            description: true,
            language: true,
            tone: true,
            identity: true,
            goals: true,
            rules: true,
            responseStyle: true,
            restrictions: true,
            status: true,
          },
        },
      },
    });

  if (
    !channel ||
    !channel.widgetKey ||
    channel.type !== "WEBSITE" ||
    !channel.isEnabled ||
    channel.employee.status !== "ACTIVE"
  ) {
    return {
      success: false,
      status: 404,
      code: "WIDGET_UNAVAILABLE",
      error:
        "Widget was not found or is unavailable.",
    };
  }

  const domainAccess =
    isWidgetRequestAllowed({
      request,
      allowedDomains:
        channel.allowedDomains,
    });

  if (!domainAccess.allowed) {
    console.warn(
      "Blocked Widget API request:",
      {
        channelId: channel.id,
        hostname:
          domainAccess.hostname,
        reason: domainAccess.reason,
      },
    );

    return {
      success: false,
      status: 403,
      code: "DOMAIN_NOT_ALLOWED",
      error:
        "This widget is not allowed on the current domain.",
    };
  }

  return {
    success: true,

    channel: {
      id: channel.id,
      name: channel.name,
      widgetKey: channel.widgetKey,
      isEnabled: channel.isEnabled,
      allowedDomains:
        channel.allowedDomains,

      widgetTitle:
        channel.widgetTitle,
      widgetGreeting:
        channel.widgetGreeting,
      widgetPrimaryColor:
        channel.widgetPrimaryColor,
      widgetPosition:
        channel.widgetPosition,

      employee: {
        id: channel.employee.id,
        workspaceId:
          channel.employee.workspaceId,
        name: channel.employee.name,
        role: channel.employee.role,
        description:
          channel.employee.description,
        language:
          channel.employee.language,
        tone: channel.employee.tone,
        identity:
          channel.employee.identity,
        goals: channel.employee.goals,
        rules: channel.employee.rules,
        responseStyle:
          channel.employee.responseStyle,
        restrictions:
          channel.employee.restrictions,
        status:
          channel.employee.status,
      },
    },

    hostname:
      domainAccess.hostname,
  };
}

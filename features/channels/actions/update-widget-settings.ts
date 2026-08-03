"use server";

import { revalidatePath } from "next/cache";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import type { UpdateWidgetSettingsState } from "@/features/channels/actions/update-widget-settings-state";
import {
  getWebsiteChannel,
  updateWebsiteChannel,
} from "@/features/channels/repositories/channel.repository";
import { updateWidgetSettingsSchema } from "@/features/channels/schemas/update-widget-settings-schema";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export async function updateWidgetSettingsAction(
  _previousState: UpdateWidgetSettingsState,
  formData: FormData,
): Promise<UpdateWidgetSettingsState> {
  const parsed = updateWidgetSettingsSchema.safeParse({
    channelId: formData.get("channelId"),
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
    isEnabled: formData.get("isEnabled"),
    widgetTitle: formData.get("widgetTitle"),
    widgetGreeting: formData.get("widgetGreeting"),
    widgetPrimaryColor: formData.get(
      "widgetPrimaryColor",
    ),
    widgetPosition: formData.get("widgetPosition"),
    allowedDomains: formData.get("allowedDomains"),
  });

  if (!parsed.success) {
    const fieldErrors: UpdateWidgetSettingsState["fieldErrors"] =
      {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        field === "isEnabled" ||
        field === "widgetTitle" ||
        field === "widgetGreeting" ||
        field === "widgetPrimaryColor" ||
        field === "widgetPosition" ||
        field === "allowedDomains"
      ) {
        fieldErrors[field] ??= issue.message;
      }
    }

    const locale =
      formData.get("locale") === "uk"
        ? "uk"
        : "en";

    return {
      success: false,
      message:
        locale === "uk"
          ? "Виправте виділені поля."
          : "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    const allowedDomains = Array.from(
      new Set(
        parsed.data.allowedDomains
          .split(/\r?\n|,/)
          .map((domain) =>
            domain.trim().toLowerCase(),
          )
          .filter(Boolean)
          .map((domain) =>
            domain
              .replace(/^https?:\/\//, "")
              .replace(/\/.*$/, "")
              .replace(/:\d+$/, ""),
          ),
      ),
    );

    const invalidDomain = allowedDomains.find(
      (domain) =>
        domain !== "localhost" &&
        !/^(\*\.)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(
          domain,
        ),
    );

    if (invalidDomain) {
      return {
        success: false,
        message:
          parsed.data.locale === "uk"
            ? `Некоректний домен: ${invalidDomain}`
            : `Invalid domain: ${invalidDomain}`,
        fieldErrors: {
          allowedDomains:
            parsed.data.locale === "uk"
              ? "Вкажіть домени без протоколу та шляху."
              : "Enter domains without protocol or path.",
        },
      };
    }

    const workspace = await getCurrentWorkspace();

    const employee = await getAIEmployee({
      employeeId: parsed.data.employeeId,
      workspaceId: workspace.id,
    });

    if (!employee) {
      return {
        success: false,
        message:
          parsed.data.locale === "uk"
            ? "ШІ-співробітника не знайдено в цьому робочому просторі."
            : "AI Employee was not found in this workspace.",
        fieldErrors: {},
      };
    }

    const channel = await getWebsiteChannel({
      employeeId: employee.id,
    });

    if (
      !channel ||
      channel.id !== parsed.data.channelId
    ) {
      return {
        success: false,
        message:
          parsed.data.locale === "uk"
            ? "Канал Website Widget не знайдено."
            : "Website channel was not found.",
        fieldErrors: {},
      };
    }

    await updateWebsiteChannel({
      channelId: channel.id,
      isEnabled: parsed.data.isEnabled,
      widgetTitle:
        parsed.data.widgetTitle || null,
      widgetGreeting:
        parsed.data.widgetGreeting || null,
      widgetPrimaryColor:
        parsed.data.widgetPrimaryColor,
      widgetPosition:
        parsed.data.widgetPosition,
      allowedDomains,
    });

    revalidatePath(
      `/${parsed.data.locale}/dashboard/employees/${employee.id}/channels`,
    );

    return {
      success: true,
      message:
        parsed.data.locale === "uk"
          ? parsed.data.isEnabled
            ? "Віджет увімкнено, налаштування збережено."
            : "Віджет вимкнено, налаштування збережено."
          : parsed.data.isEnabled
            ? "Widget enabled and settings saved."
            : "Widget disabled and settings saved.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "Failed to update widget settings:",
      error,
    );

    return {
      success: false,
      message:
        parsed.data.locale === "uk"
          ? "Не вдалося зберегти налаштування."
          : "Unable to save widget settings.",
      fieldErrors: {},
    };
  }
}

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
    widgetTitle: formData.get("widgetTitle"),
    widgetGreeting: formData.get("widgetGreeting"),
    widgetPrimaryColor: formData.get("widgetPrimaryColor"),
    widgetPosition: formData.get("widgetPosition"),
  });

  if (!parsed.success) {
    const fieldErrors: UpdateWidgetSettingsState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        field === "widgetTitle" ||
        field === "widgetGreeting" ||
        field === "widgetPrimaryColor" ||
        field === "widgetPosition"
      ) {
        fieldErrors[field] ??= issue.message;
      }
    }

    const locale =
  formData.get("locale") === "uk" ? "uk" : "en";

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

    if (!channel || channel.id !== parsed.data.channelId) {
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
      widgetTitle: parsed.data.widgetTitle || null,
      widgetGreeting: parsed.data.widgetGreeting || null,
      widgetPrimaryColor: parsed.data.widgetPrimaryColor,
      widgetPosition: parsed.data.widgetPosition,
    });

    revalidatePath(
      `/${parsed.data.locale}/dashboard/employees/${employee.id}/channels`,
    );

    return {
      success: true,
      message:
        parsed.data.locale === "uk"
          ? "Налаштування віджета збережено."
          : "Widget settings saved successfully.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error("Failed to update widget settings:", error);

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
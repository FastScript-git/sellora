import { z } from "zod";

export const updateWidgetSettingsSchema = z.object({
  channelId: z.string().trim().min(1),

  employeeId: z.string().trim().min(1),

  locale: z.enum(["en", "uk"]),

  isEnabled: z.preprocess(
    (value) =>
      value === true ||
      value === "true" ||
      value === "on" ||
      value === "1",
    z.boolean(),
  ),

  widgetTitle: z
    .string()
    .trim()
    .max(
      80,
      "Widget title must contain at most 80 characters.",
    ),

  widgetGreeting: z
    .string()
    .trim()
    .max(
      500,
      "Greeting must contain at most 500 characters.",
    ),

  widgetPrimaryColor: z
    .string()
    .trim()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "Select a valid hexadecimal color.",
    ),

  widgetPosition: z.enum([
    "bottom-right",
    "bottom-left",
  ]),
  allowedDomains: z
  .string()
  .trim()
  .max(
    5000,
    "Allowed domains list is too large.",
  ),
});

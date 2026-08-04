"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createGoogleCalendarEvent } from "@/features/integrations/google-calendar/google-calendar.service";

const testCalendarEventSchema = z.object({
  locale: z.enum(["en", "uk"]),
});

export async function createTestCalendarEventAction(
  formData: FormData,
) {
  const parsed =
    testCalendarEventSchema.safeParse({
      locale: formData.get("locale"),
    });

  const locale =
    parsed.success &&
    parsed.data.locale === "uk"
      ? "uk"
      : "en";

  let redirectUrl: string;

  try {
    const start = new Date(
      Date.now() + 5 * 60 * 1000,
    );

    const end = new Date(
      start.getTime() +
        30 * 60 * 1000,
    );

    const event =
      await createGoogleCalendarEvent({
        title:
          "Sellora Google Calendar test",
        description:
          "This event confirms that Sellora can create Google Calendar events.",
        startDateTime:
          start.toISOString(),
        endDateTime:
          end.toISOString(),
        timeZone: "Europe/Kyiv",
      });

    const params =
      new URLSearchParams({
        status: "success",
      });

    if (event.htmlLink) {
      params.set(
        "eventUrl",
        event.htmlLink,
      );
    }

    redirectUrl =
      `/${locale}/dashboard/integrations/google-calendar?${params.toString()}`;
  } catch (error) {
    console.error(
      "Google Calendar test failed:",
      error,
    );

    const errorCode =
      error instanceof Error
        ? error.message
        : "GOOGLE_CALENDAR_UNKNOWN_ERROR";

    const params =
      new URLSearchParams({
        status: "error",
        error: errorCode,
      });

    redirectUrl =
      `/${locale}/dashboard/integrations/google-calendar?${params.toString()}`;
  }

  redirect(redirectUrl);
}

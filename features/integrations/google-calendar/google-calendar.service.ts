import "server-only";

import { google } from "googleapis";

import { getGoogleOAuthClient } from "@/features/integrations/google/google-oauth-client";

type CreateGoogleCalendarEventInput = {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeEmails?: string[];
};

export async function createGoogleCalendarEvent({
  title,
  description,
  startDateTime,
  endDateTime,
  timeZone,
  attendeeEmails = [],
}: CreateGoogleCalendarEventInput) {
  const oauth2Client =
    await getGoogleOAuthClient();

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  const response =
    await calendar.events.insert({
      calendarId: "primary",
      sendUpdates:
        attendeeEmails.length > 0
          ? "all"
          : "none",
      requestBody: {
        summary: title,
        description:
          description || undefined,
        start: {
          dateTime: startDateTime,
          timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone,
        },
        attendees:
          attendeeEmails.length > 0
            ? attendeeEmails.map(
                (email) => ({
                  email,
                }),
              )
            : undefined,
      },
    });

  if (!response.data.id) {
    throw new Error(
      "GOOGLE_CALENDAR_EVENT_NOT_CREATED",
    );
  }

  return {
    id: response.data.id,
    htmlLink:
      response.data.htmlLink ?? null,
    status:
      response.data.status ?? null,
  };
}

import "server-only";

import {
  auth,
  clerkClient,
} from "@clerk/nextjs/server";
import { google } from "googleapis";

type CreateGoogleCalendarEventInput = {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeEmails?: string[];
};

async function getGoogleOAuthAccessToken() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  const client = await clerkClient();

  const response =
    await client.users.getUserOauthAccessToken(
      userId,
      "google",
    );

  const token =
    response.data[0]?.token;

  if (!token) {
    throw new Error(
      "GOOGLE_CALENDAR_NOT_CONNECTED",
    );
  }

  return token;
}

export async function createGoogleCalendarEvent({
  title,
  description,
  startDateTime,
  endDateTime,
  timeZone,
  attendeeEmails = [],
}: CreateGoogleCalendarEventInput) {
  const accessToken =
    await getGoogleOAuthAccessToken();

  const oauth2Client =
    new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

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

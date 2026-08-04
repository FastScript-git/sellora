import "server-only";

import { z } from "zod";

import { createGoogleCalendarEvent } from "@/features/integrations/google-calendar/google-calendar.service";

export const CALENDAR_TOOL_NAME =
  "create_google_calendar_event";

export const calendarToolDefinition = {
  type: "function" as const,
  name: CALENDAR_TOOL_NAME,
  description:
    "Create an event in the authenticated user's Google Calendar. Use this only when the user explicitly asks to schedule, book, or create a calendar event and provides enough date and time information.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: {
        type: "string",
        description:
          "Short, clear title for the calendar event.",
      },
      description: {
        type: ["string", "null"],
        description:
          "Optional event description. Use null when none is needed.",
      },
      startDateTime: {
        type: "string",
        description:
          "Event start as a complete ISO 8601 date-time with UTC offset, for example 2026-08-05T15:00:00+03:00.",
      },
      endDateTime: {
        type: "string",
        description:
          "Event end as a complete ISO 8601 date-time with UTC offset. It must be later than the start.",
      },
      timeZone: {
        type: "string",
        description:
          "IANA time zone, for example Europe/Kyiv.",
      },
      attendeeEmails: {
        type: "array",
        description:
          "Email addresses of attendees. Use an empty array when no attendees were provided.",
        items: {
          type: "string",
        },
      },
    },
    required: [
      "title",
      "description",
      "startDateTime",
      "endDateTime",
      "timeZone",
      "attendeeEmails",
    ],
  },
};

const calendarToolInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z
      .string()
      .trim()
      .max(5000)
      .nullable(),
    startDateTime: z
      .string()
      .datetime({
        offset: true,
      }),
    endDateTime: z
      .string()
      .datetime({
        offset: true,
      }),
    timeZone: z
      .string()
      .trim()
      .min(1)
      .max(100),
    attendeeEmails: z
      .array(
        z.string().trim().email(),
      )
      .max(20),
  })
  .superRefine((value, context) => {
    const start = new Date(
      value.startDateTime,
    );

    const end = new Date(
      value.endDateTime,
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return;
    }

    if (end <= start) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDateTime"],
        message:
          "Event end must be later than event start.",
      });
    }
  });

export type CalendarToolExecution = {
  name: typeof CALENDAR_TOOL_NAME;
  success: boolean;
  title: string | null;
  details: string;
  eventUrl: string | null;
};

export async function executeCalendarTool(
  rawArguments: string,
): Promise<{
  output: string;
  execution: CalendarToolExecution;
}> {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawArguments);
  } catch {
    const execution: CalendarToolExecution = {
      name: CALENDAR_TOOL_NAME,
      success: false,
      title: null,
      details:
        "Calendar tool arguments were not valid JSON.",
      eventUrl: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error:
          "INVALID_CALENDAR_TOOL_ARGUMENTS",
      }),
      execution,
    };
  }

  const parsed =
    calendarToolInputSchema.safeParse(
      parsedJson,
    );

  if (!parsed.success) {
    const details = parsed.error.issues
      .map(
        (issue) =>
          `${issue.path.join(".")}: ${issue.message}`,
      )
      .join("; ");

    const execution: CalendarToolExecution = {
      name: CALENDAR_TOOL_NAME,
      success: false,
      title: null,
      details,
      eventUrl: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error:
          "INVALID_CALENDAR_EVENT_DATA",
        details,
      }),
      execution,
    };
  }

  try {
    const event =
      await createGoogleCalendarEvent({
        title: parsed.data.title,
        description:
          parsed.data.description ??
          undefined,
        startDateTime:
          parsed.data.startDateTime,
        endDateTime:
          parsed.data.endDateTime,
        timeZone:
          parsed.data.timeZone,
        attendeeEmails:
          parsed.data.attendeeEmails,
      });

    const execution: CalendarToolExecution = {
      name: CALENDAR_TOOL_NAME,
      success: true,
      title: parsed.data.title,
      details:
        `Calendar event created: ${parsed.data.startDateTime}`,
      eventUrl: event.htmlLink,
    };

    return {
      output: JSON.stringify({
        success: true,
        eventId: event.id,
        eventUrl: event.htmlLink,
        status: event.status,
        title: parsed.data.title,
        startDateTime:
          parsed.data.startDateTime,
        endDateTime:
          parsed.data.endDateTime,
        timeZone:
          parsed.data.timeZone,
      }),
      execution,
    };
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message
        : "GOOGLE_CALENDAR_UNKNOWN_ERROR";

    const execution: CalendarToolExecution = {
      name: CALENDAR_TOOL_NAME,
      success: false,
      title: parsed.data.title,
      details: errorCode,
      eventUrl: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error: errorCode,
      }),
      execution,
    };
  }
}

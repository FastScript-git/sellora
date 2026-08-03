import type {
  MeetingLocationType,
  MeetingStatus,
} from "@/lib/generated/prisma/client";

import { z } from "zod";

export const MEETING_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELED",
  "NO_SHOW",
] as const satisfies readonly MeetingStatus[];

export const MEETING_LOCATION_TYPES = [
  "ONLINE",
  "PHONE",
  "IN_PERSON",
] as const satisfies readonly MeetingLocationType[];

const optionalRelationIdSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "Date is required.")
  .transform((value, context) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Invalid date.",
      });

      return z.NEVER;
    }

    return date;
  });

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value, context) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Invalid date.",
      });

      return z.NEVER;
    }

    return date;
  });

const localeSchema = z
  .string()
  .trim()
  .min(2)
  .max(10);

const meetingFieldsSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Meeting title is required.")
      .max(200, "Meeting title is too long."),

    description: optionalTextSchema,

    contactId: optionalRelationIdSchema,

    employeeId: optionalRelationIdSchema,

    locationType: z
      .enum(MEETING_LOCATION_TYPES)
      .default("ONLINE"),

    locationUrl: optionalTextSchema,

    locationAddress: optionalTextSchema,

    phoneNumber: optionalTextSchema,

    startsAt: requiredDateSchema,

    endsAt: requiredDateSchema,

    reminderAt: optionalDateSchema,

    locale: localeSchema,
  })
  .superRefine((value, context) => {
    if (value.endsAt <= value.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message:
          "Meeting end time must be later than start time.",
      });
    }

    if (
      value.reminderAt &&
      value.reminderAt >= value.startsAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["reminderAt"],
        message:
          "Reminder must be scheduled before the meeting.",
      });
    }

    if (
      value.locationType === "ONLINE" &&
      value.locationUrl &&
      !isValidUrl(value.locationUrl)
    ) {
      context.addIssue({
        code: "custom",
        path: ["locationUrl"],
        message: "Enter a valid meeting URL.",
      });
    }
  });

export const createMeetingSchema = meetingFieldsSchema;

export const updateMeetingSchema =
  meetingFieldsSchema.extend({
    meetingId: z
      .string()
      .trim()
      .min(1, "Meeting ID is required."),
  });

export const updateMeetingStatusSchema = z.object({
  meetingId: z
    .string()
    .trim()
    .min(1),

  status: z.enum(MEETING_STATUSES),

  locale: localeSchema,
});

export const deleteMeetingSchema = z.object({
  meetingId: z
    .string()
    .trim()
    .min(1),

  locale: localeSchema,
});

export type CreateMeetingInput = z.input<
  typeof createMeetingSchema
>;

export type UpdateMeetingInput = z.input<
  typeof updateMeetingSchema
>;

export type UpdateMeetingStatusInput = z.input<
  typeof updateMeetingStatusSchema
>;

export type DeleteMeetingInput = z.input<
  typeof deleteMeetingSchema
>;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);

    return true;
  } catch {
    return false;
  }
}

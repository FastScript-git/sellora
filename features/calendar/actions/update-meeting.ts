"use server";

import { revalidatePath } from "next/cache";

import {
  updateMeetingSchema,
  type UpdateMeetingInput,
} from "@/features/calendar/actions/meeting.schemas";
import {
  getMeetingById,
  updateMeeting,
} from "@/features/calendar/repositories/meeting.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

type UpdateMeetingResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function updateMeetingAction(
  input: UpdateMeetingInput,
): Promise<UpdateMeetingResult> {
  const parsedInput =
    updateMeetingSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid meeting data.",
      fieldErrors:
        parsedInput.error.flatten().fieldErrors,
    };
  }

  const {
    meetingId,
    title,
    description,
    contactId,
    employeeId,
    locationType,
    locationUrl,
    locationAddress,
    phoneNumber,
    startsAt,
    endsAt,
    reminderAt,
    locale,
  } = parsedInput.data;

  try {
    const workspace = await getCurrentWorkspace();

    const existingMeeting = await getMeetingById({
      meetingId,
      workspaceId: workspace.id,
    });

    if (!existingMeeting) {
      return {
        success: false,
        error: "Meeting was not found.",
      };
    }

    const [contact, employee] = await Promise.all([
      contactId
        ? prisma.contact.findFirst({
            where: {
              id: contactId,
              workspaceId: workspace.id,
            },
            select: {
              id: true,
            },
          })
        : Promise.resolve(null),

      employeeId
        ? prisma.aIEmployee.findFirst({
            where: {
              id: employeeId,
              workspaceId: workspace.id,
            },
            select: {
              id: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (contactId && !contact) {
      return {
        success: false,
        error: "The selected contact is invalid.",
      };
    }

    if (employeeId && !employee) {
      return {
        success: false,
        error:
          "The selected AI employee is invalid.",
      };
    }

    const result = await updateMeeting({
      meetingId,
      workspaceId: workspace.id,
      title,
      description,
      contactId,
      employeeId,
      locationType,
      locationUrl,
      locationAddress,
      phoneNumber,
      startsAt,
      endsAt,
      reminderAt,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Meeting was not updated.",
      };
    }

    revalidatePath(`/${locale}/dashboard/calendar`);

    if (existingMeeting.contactId) {
      revalidatePath(
        `/${locale}/dashboard/contacts/${existingMeeting.contactId}`,
      );
    }

    if (
      contactId &&
      contactId !== existingMeeting.contactId
    ) {
      revalidatePath(
        `/${locale}/dashboard/contacts/${contactId}`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update meeting:", error);

    return {
      success: false,
      error: "Failed to update meeting.",
    };
  }
}

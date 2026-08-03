"use server";

import { revalidatePath } from "next/cache";

import {
  createMeetingSchema,
  type CreateMeetingInput,
} from "@/features/calendar/actions/meeting.schemas";
import { createMeeting } from "@/features/calendar/repositories/meeting.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

type CreateMeetingResult =
  | {
      success: true;
      meetingId: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function createMeetingAction(
  input: CreateMeetingInput,
): Promise<CreateMeetingResult> {
  const parsedInput =
    createMeetingSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid meeting data.",
      fieldErrors:
        parsedInput.error.flatten().fieldErrors,
    };
  }

  const {
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

    const relationsAreValid =
      await validateMeetingRelations({
        workspaceId: workspace.id,
        contactId,
        employeeId,
      });

    if (!relationsAreValid) {
      return {
        success: false,
        error:
          "The selected contact or AI employee is invalid.",
      };
    }

    const meeting = await createMeeting({
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

    revalidateMeetingPaths({
      locale,
      contactId,
      employeeId,
    });

    return {
      success: true,
      meetingId: meeting.id,
    };
  } catch (error) {
    console.error("Failed to create meeting:", error);

    return {
      success: false,
      error: "Failed to create meeting.",
    };
  }
}

type ValidateMeetingRelationsParams = {
  workspaceId: string;
  contactId: string | null;
  employeeId: string | null;
};

async function validateMeetingRelations({
  workspaceId,
  contactId,
  employeeId,
}: ValidateMeetingRelationsParams): Promise<boolean> {
  const [contact, employee] = await Promise.all([
    contactId
      ? prisma.contact.findFirst({
          where: {
            id: contactId,
            workspaceId,
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
            workspaceId,
          },
          select: {
            id: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (contactId && !contact) {
    return false;
  }

  if (employeeId && !employee) {
    return false;
  }

  return true;
}

type RevalidateMeetingPathsParams = {
  locale: string;
  contactId?: string | null;
  employeeId?: string | null;
};

function revalidateMeetingPaths({
  locale,
  contactId,
  employeeId,
}: RevalidateMeetingPathsParams): void {
  revalidatePath(`/${locale}/dashboard/calendar`);

  if (contactId) {
    revalidatePath(
      `/${locale}/dashboard/contacts/${contactId}`,
    );
  }

  if (employeeId) {
    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}`,
    );
  }
}

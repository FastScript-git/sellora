"use server";

import { revalidatePath } from "next/cache";

import {
  updateMeetingStatusSchema,
  type UpdateMeetingStatusInput,
} from "@/features/calendar/actions/meeting.schemas";
import {
  getMeetingById,
  updateMeetingStatus,
} from "@/features/calendar/repositories/meeting.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type UpdateMeetingStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function updateMeetingStatusAction(
  input: UpdateMeetingStatusInput,
): Promise<UpdateMeetingStatusResult> {
  const parsedInput =
    updateMeetingStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid meeting status data.",
    };
  }

  const { meetingId, status, locale } =
    parsedInput.data;

  try {
    const workspace = await getCurrentWorkspace();

    const meeting = await getMeetingById({
      meetingId,
      workspaceId: workspace.id,
    });

    if (!meeting) {
      return {
        success: false,
        error: "Meeting was not found.",
      };
    }

    const result = await updateMeetingStatus({
      meetingId,
      workspaceId: workspace.id,
      status,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Meeting status was not updated.",
      };
    }

    revalidatePath(`/${locale}/dashboard/calendar`);

    if (meeting.contactId) {
      revalidatePath(
        `/${locale}/dashboard/contacts/${meeting.contactId}`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to update meeting status:",
      error,
    );

    return {
      success: false,
      error: "Failed to update meeting status.",
    };
  }
}

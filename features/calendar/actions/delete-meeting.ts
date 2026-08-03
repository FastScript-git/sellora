"use server";

import { revalidatePath } from "next/cache";

import {
  deleteMeetingSchema,
  type DeleteMeetingInput,
} from "@/features/calendar/actions/meeting.schemas";
import {
  deleteMeeting,
  getMeetingById,
} from "@/features/calendar/repositories/meeting.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type DeleteMeetingResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function deleteMeetingAction(
  input: DeleteMeetingInput,
): Promise<DeleteMeetingResult> {
  const parsedInput =
    deleteMeetingSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid meeting data.",
    };
  }

  const { meetingId, locale } = parsedInput.data;

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

    const result = await deleteMeeting({
      meetingId,
      workspaceId: workspace.id,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Meeting was not deleted.",
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
    console.error("Failed to delete meeting:", error);

    return {
      success: false,
      error: "Failed to delete meeting.",
    };
  }
}

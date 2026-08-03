import type {
  MeetingLocationType,
  MeetingStatus,
} from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type GetMeetingsByWorkspaceParams = {
  workspaceId: string;
  status?: MeetingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  contactId?: string;
  employeeId?: string;
};

export async function getMeetingsByWorkspace({
  workspaceId,
  status,
  dateFrom,
  dateTo,
  contactId,
  employeeId,
}: GetMeetingsByWorkspaceParams) {
  return prisma.meeting.findMany({
    where: {
      workspaceId,
      ...(status ? { status } : {}),
      ...(contactId ? { contactId } : {}),
      ...(employeeId ? { employeeId } : {}),
      ...(
        dateFrom || dateTo
          ? {
              startsAt: {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo } : {}),
              },
            }
          : {}
      ),
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          jobTitle: true,
          status: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
    orderBy: [
      {
        startsAt: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

type GetMeetingByIdParams = {
  meetingId: string;
  workspaceId: string;
};

export async function getMeetingById({
  meetingId,
  workspaceId,
}: GetMeetingByIdParams) {
  return prisma.meeting.findFirst({
    where: {
      id: meetingId,
      workspaceId,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          jobTitle: true,
          status: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

type CreateMeetingParams = {
  workspaceId: string;
  title: string;
  description?: string | null;
  contactId?: string | null;
  employeeId?: string | null;
  status?: MeetingStatus;
  locationType?: MeetingLocationType;
  locationUrl?: string | null;
  locationAddress?: string | null;
  phoneNumber?: string | null;
  startsAt: Date;
  endsAt: Date;
  reminderAt?: Date | null;
};

export async function createMeeting({
  workspaceId,
  title,
  description,
  contactId,
  employeeId,
  status = "SCHEDULED",
  locationType = "ONLINE",
  locationUrl,
  locationAddress,
  phoneNumber,
  startsAt,
  endsAt,
  reminderAt,
}: CreateMeetingParams) {
  return prisma.meeting.create({
    data: {
      workspaceId,
      title,
      description,
      contactId,
      employeeId,
      status,
      locationType,
      locationUrl,
      locationAddress,
      phoneNumber,
      startsAt,
      endsAt,
      reminderAt,
    },
  });
}

type UpdateMeetingParams = {
  meetingId: string;
  workspaceId: string;
  title?: string;
  description?: string | null;
  contactId?: string | null;
  employeeId?: string | null;
  status?: MeetingStatus;
  locationType?: MeetingLocationType;
  locationUrl?: string | null;
  locationAddress?: string | null;
  phoneNumber?: string | null;
  startsAt?: Date;
  endsAt?: Date;
  reminderAt?: Date | null;
  completedAt?: Date | null;
  canceledAt?: Date | null;
};

export async function updateMeeting({
  meetingId,
  workspaceId,
  ...data
}: UpdateMeetingParams) {
  return prisma.meeting.updateMany({
    where: {
      id: meetingId,
      workspaceId,
    },
    data,
  });
}

type UpdateMeetingStatusParams = {
  meetingId: string;
  workspaceId: string;
  status: MeetingStatus;
};

export async function updateMeetingStatus({
  meetingId,
  workspaceId,
  status,
}: UpdateMeetingStatusParams) {
  const completedAt =
    status === "COMPLETED" ? new Date() : null;

  const canceledAt =
    status === "CANCELED" ? new Date() : null;

  return prisma.meeting.updateMany({
    where: {
      id: meetingId,
      workspaceId,
    },
    data: {
      status,
      completedAt,
      canceledAt,
    },
  });
}

type DeleteMeetingParams = {
  meetingId: string;
  workspaceId: string;
};

export async function deleteMeeting({
  meetingId,
  workspaceId,
}: DeleteMeetingParams) {
  return prisma.meeting.deleteMany({
    where: {
      id: meetingId,
      workspaceId,
    },
  });
}

type GetUpcomingMeetingsParams = {
  workspaceId: string;
  limit?: number;
};

export async function getUpcomingMeetings({
  workspaceId,
  limit = 10,
}: GetUpcomingMeetingsParams) {
  return prisma.meeting.findMany({
    where: {
      workspaceId,
      status: "SCHEDULED",
      startsAt: {
        gte: new Date(),
      },
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: limit,
  });
}

export async function getMeetingContactOptions(
  workspaceId: string,
) {
  return prisma.contact.findMany({
    where: {
      workspaceId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
      {
        email: "asc",
      },
    ],
  });
}

export async function getMeetingEmployeeOptions(
  workspaceId: string,
) {
  return prisma.aIEmployee.findMany({
    where: {
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

import { prisma } from "@/lib/prisma";

const ACTIVITY_SOURCE_LIMIT = 8;
const DASHBOARD_ACTIVITY_LIMIT = 12;

export type DashboardActivityType =
  | "CONTACT_CREATED"
  | "CONVERSATION_UPDATED"
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "MEETING_CREATED";

export type DashboardActivityItem = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string | null;
  occurredAt: Date;
  href: string;
  metadata: {
    contactName?: string;
    employeeName?: string;
    status?: string;
  };
};

type GetDashboardRecentActivityParams = {
  workspaceId: string;
  locale: string;
  limit?: number;
};

export async function getDashboardRecentActivity({
  workspaceId,
  locale,
  limit = DASHBOARD_ACTIVITY_LIMIT,
}: GetDashboardRecentActivityParams): Promise<
  DashboardActivityItem[]
> {
  const [
    contacts,
    conversations,
    tasks,
    meetings,
  ] = await Promise.all([
    prisma.contact.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ACTIVITY_SOURCE_LIMIT,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        createdAt: true,
      },
    }),

    prisma.conversation.findMany({
      where: {
        employee: {
          workspaceId,
        },
      },
      orderBy: [
        {
          lastMessageAt: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      take: ACTIVITY_SOURCE_LIMIT,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        lastMessageAt: true,
        employee: {
          select: {
            name: true,
          },
        },
        contact: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            content: true,
          },
        },
      },
    }),

    prisma.task.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: ACTIVITY_SOURCE_LIMIT,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        contact: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.meeting.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ACTIVITY_SOURCE_LIMIT,
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
        createdAt: true,
        contact: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const contactActivities: DashboardActivityItem[] =
    contacts.map((contact) => {
      const contactName = getPersonName(
        contact,
        contact.email ?? "Anonymous contact",
      );

      return {
        id: `contact-${contact.id}`,
        type: "CONTACT_CREATED",
        title: contactName,
        description: contact.company,
        occurredAt: contact.createdAt,
        href: `/${locale}/dashboard/contacts/${contact.id}`,
        metadata: {
          contactName,
        },
      };
    });

  const conversationActivities: DashboardActivityItem[] =
    conversations.map((conversation) => {
      const contactName = conversation.contact
        ? getPersonName(
            conversation.contact,
            conversation.contact.email ??
              "Anonymous visitor",
          )
        : "Anonymous visitor";

      return {
        id: `conversation-${conversation.id}`,
        type: "CONVERSATION_UPDATED",
        title:
          conversation.title ||
          contactName ||
          "Conversation",
        description:
          conversation.messages[0]?.content ?? null,
        occurredAt:
          conversation.lastMessageAt ??
          conversation.updatedAt,
        href:
          `/${locale}/dashboard/conversations` +
          `?conversationId=${conversation.id}`,
        metadata: {
          contactName,
          employeeName:
            conversation.employee.name,
          status: conversation.status,
        },
      };
    });

  const taskActivities: DashboardActivityItem[] =
    tasks.map((task) => {
      const isCompleted =
        task.status === "COMPLETED";

      const contactName = task.contact
        ? getPersonName(
            task.contact,
            task.contact.email ??
              "Anonymous contact",
          )
        : undefined;

      return {
        id: `task-${task.id}`,
        type: isCompleted
          ? "TASK_COMPLETED"
          : "TASK_CREATED",
        title: task.title,
        description:
          task.description ?? contactName ?? null,
        occurredAt:
          isCompleted && task.completedAt
            ? task.completedAt
            : task.updatedAt,
        href: `/${locale}/dashboard/tasks`,
        metadata: {
          contactName,
          employeeName: task.employee?.name,
          status: task.status,
        },
      };
    });

  const meetingActivities: DashboardActivityItem[] =
    meetings.map((meeting) => {
      const contactName = meeting.contact
        ? getPersonName(
            meeting.contact,
            meeting.contact.email ??
              "Anonymous contact",
          )
        : undefined;

      return {
        id: `meeting-${meeting.id}`,
        type: "MEETING_CREATED",
        title: meeting.title,
        description: contactName ?? null,
        occurredAt: meeting.createdAt,
        href: `/${locale}/dashboard/calendar`,
        metadata: {
          contactName,
          employeeName: meeting.employee?.name,
          status: meeting.status,
        },
      };
    });

  return [
    ...contactActivities,
    ...conversationActivities,
    ...taskActivities,
    ...meetingActivities,
  ]
    .sort(
      (first, second) =>
        second.occurredAt.getTime() -
        first.occurredAt.getTime(),
    )
    .slice(0, limit);
}

type PersonNameInput = {
  firstName: string | null;
  lastName: string | null;
};

function getPersonName(
  person: PersonNameInput,
  fallback: string,
): string {
  const fullName = [
    person.firstName,
    person.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || fallback;
}

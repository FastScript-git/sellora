import { prisma } from "@/lib/prisma";

const ANALYTICS_PERIOD_DAYS = 30;
const RECENT_CONVERSATIONS_LIMIT = 8;

function getStartOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function getPeriodStart(): Date {
  const start = getStartOfDay(new Date());

  start.setDate(
    start.getDate() - (ANALYTICS_PERIOD_DAYS - 1),
  );

  return start;
}

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function createDailyConversationSeries(
  conversations: Array<{
    createdAt: Date;
  }>,
) {
  const periodStart = getPeriodStart();

  const countsByDate = new Map<string, number>();

  for (const conversation of conversations) {
    const dateKey = getDateKey(conversation.createdAt);

    countsByDate.set(
      dateKey,
      (countsByDate.get(dateKey) ?? 0) + 1,
    );
  }

  return Array.from(
    {
      length: ANALYTICS_PERIOD_DAYS,
    },
    (_, index) => {
      const date = new Date(periodStart);

      date.setDate(periodStart.getDate() + index);

      const dateKey = getDateKey(date);

      return {
        date,
        dateKey,
        conversations: countsByDate.get(dateKey) ?? 0,
      };
    },
  );
}

export async function getWorkspaceAnalytics(
  workspaceId: string,
) {
  const periodStart = getPeriodStart();

  const [
    aiEmployees,
    activeEmployees,
    allConversations,
    periodConversations,
    messages,
    periodMessages,
    contacts,
    knowledgeSources,
    websiteChannels,
    channels,
    employeeStats,
    recentConversations,
  ] = await Promise.all([
    prisma.aIEmployee.count({
      where: {
        workspaceId,
      },
    }),

    prisma.aIEmployee.count({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
    }),

    prisma.conversation.findMany({
      where: {
        employee: {
          workspaceId,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.conversation.findMany({
      where: {
        employee: {
          workspaceId,
        },
        createdAt: {
          gte: periodStart,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.conversationMessage.count({
      where: {
        conversation: {
          employee: {
            workspaceId,
          },
        },
      },
    }),

    prisma.conversationMessage.findMany({
      where: {
        conversation: {
          employee: {
            workspaceId,
          },
        },
        createdAt: {
          gte: periodStart,
        },
      },
      select: {
        role: true,
      },
    }),

    prisma.contact.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        status: true,
        leadScore: true,
        sentiment: true,
        createdAt: true,
      },
    }),

    prisma.knowledgeSource.count({
      where: {
        employee: {
          workspaceId,
        },
      },
    }),

    prisma.channel.count({
      where: {
        employee: {
          workspaceId,
        },
        type: "WEBSITE",
        isEnabled: true,
      },
    }),

    prisma.channel.findMany({
      where: {
        employee: {
          workspaceId,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        conversations: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.aIEmployee.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        conversations: {
          select: {
            id: true,
            status: true,
            messages: {
              select: {
                id: true,
              },
            },
            contact: {
              select: {
                status: true,
                leadScore: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
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
      take: RECENT_CONVERSATIONS_LIMIT,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        lastMessageAt: true,
        unreadCount: true,
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            status: true,
            leadScore: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
  ]);

  const openConversations = allConversations.filter(
    (conversation) => conversation.status === "OPEN",
  ).length;

  const closedConversations = allConversations.filter(
    (conversation) => conversation.status === "CLOSED",
  ).length;

  const archivedConversations = allConversations.filter(
    (conversation) => conversation.status === "ARCHIVED",
  ).length;

  const userMessages = periodMessages.filter(
    (message) => message.role === "USER",
  ).length;

  const assistantMessages = periodMessages.filter(
    (message) => message.role === "ASSISTANT",
  ).length;

  const qualifiedLeads = contacts.filter(
    (contact) =>
      contact.status === "QUALIFIED" ||
      contact.status === "CUSTOMER",
  ).length;

  const customers = contacts.filter(
    (contact) => contact.status === "CUSTOMER",
  ).length;

  const contactsWithLeadScore = contacts.filter(
    (
      contact,
    ): contact is typeof contact & {
      leadScore: number;
    } => contact.leadScore !== null,
  );

  const averageLeadScore =
    contactsWithLeadScore.length > 0
      ? Math.round(
          contactsWithLeadScore.reduce(
            (total, contact) =>
              total + contact.leadScore,
            0,
          ) / contactsWithLeadScore.length,
        )
      : null;

  const leadConversionRate =
    contacts.length > 0
      ? Math.round(
          (qualifiedLeads / contacts.length) * 100,
        )
      : 0;

  const conversationCloseRate =
    allConversations.length > 0
      ? Math.round(
          (closedConversations /
            allConversations.length) *
            100,
        )
      : 0;

  const dailyConversations =
    createDailyConversationSeries(
      periodConversations,
    );

  const channelBreakdown = channels
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      conversations: channel.conversations.length,
    }))
    .sort(
      (first, second) =>
        second.conversations - first.conversations,
    );

  const employeePerformance = employeeStats
    .map((employee) => {
      const conversations =
        employee.conversations.length;

      const employeeMessages =
        employee.conversations.reduce(
          (total, conversation) =>
            total + conversation.messages.length,
          0,
        );

      const closed =
        employee.conversations.filter(
          (conversation) =>
            conversation.status === "CLOSED",
        ).length;

      const qualified =
        employee.conversations.filter(
          (conversation) =>
            conversation.contact?.status ===
              "QUALIFIED" ||
            conversation.contact?.status ===
              "CUSTOMER",
        ).length;

      const leadScores =
        employee.conversations.flatMap(
          (conversation) =>
            conversation.contact?.leadScore !== null &&
            conversation.contact?.leadScore !== undefined
              ? [conversation.contact.leadScore]
              : [],
        );

      const employeeAverageLeadScore =
        leadScores.length > 0
          ? Math.round(
              leadScores.reduce(
                (total, score) => total + score,
                0,
              ) / leadScores.length,
            )
          : null;

      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        status: employee.status,
        conversations,
        messages: employeeMessages,
        closedConversations: closed,
        qualifiedLeads: qualified,
        averageLeadScore:
          employeeAverageLeadScore,
      };
    })
    .sort(
      (first, second) =>
        second.conversations - first.conversations,
    );

  return {
    periodDays: ANALYTICS_PERIOD_DAYS,

    overview: {
      aiEmployees,
      activeEmployees,
      conversations: allConversations.length,
      conversationsLast30Days:
        periodConversations.length,
      openConversations,
      closedConversations,
      archivedConversations,
      messages,
      messagesLast30Days: periodMessages.length,
      userMessagesLast30Days: userMessages,
      assistantMessagesLast30Days:
        assistantMessages,
      contacts: contacts.length,
      qualifiedLeads,
      customers,
      averageLeadScore,
      leadConversionRate,
      conversationCloseRate,
      knowledgeSources,
      websiteChannels,
    },

    dailyConversations,
    channelBreakdown,
    employeePerformance,
    recentConversations,
  };
}

export type WorkspaceAnalytics = Awaited<
  ReturnType<typeof getWorkspaceAnalytics>
>;

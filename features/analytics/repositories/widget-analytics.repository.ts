import { prisma } from "@/lib/prisma";

const WIDGET_ANALYTICS_PERIOD_DAYS = 30;
const RECENT_EVENT_LIMIT = 20;
const TOP_PAGE_LIMIT = 8;
const TOP_REFERRER_LIMIT = 8;

type GetWidgetAnalyticsParams = {
  workspaceId: string;
  periodDays?: number;
};

function calculateRate(
  value: number,
  base: number,
) {
  if (base <= 0) {
    return 0;
  }

  return Math.round((value / base) * 100);
}

function normalizePageLabel(pageUrl: string | null) {
  if (!pageUrl) {
    return "Unknown page";
  }

  try {
    const url = new URL(pageUrl);

    return `${url.hostname}${url.pathname}`;
  } catch {
    return pageUrl;
  }
}

function normalizeReferrerLabel(
  referrer: string | null,
) {
  if (!referrer) {
    return "Direct";
  }

  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

function createDailySeries(
  events: Array<{
    type:
      | "VIEW"
      | "OPEN"
      | "CONVERSATION_STARTED"
      | "USER_MESSAGE"
      | "LEAD_CREATED"
      | "AI_RESPONSE";
    createdAt: Date;
  }>,
  periodDays: number,
) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const series = Array.from(
    {
      length: periodDays,
    },
    (_, index) => {
      const date = new Date(today);

      date.setDate(
        today.getDate() -
          (periodDays - index - 1),
      );

      return {
        date,
        dateKey: date.toISOString().slice(0, 10),
        views: 0,
        opens: 0,
        conversations: 0,
      };
    },
  );

  const seriesByDate = new Map(
    series.map((item) => [
      item.dateKey,
      item,
    ]),
  );

  for (const event of events) {
    const dateKey = event.createdAt
      .toISOString()
      .slice(0, 10);

    const item = seriesByDate.get(dateKey);

    if (!item) {
      continue;
    }

    if (event.type === "VIEW") {
      item.views += 1;
    }

    if (event.type === "OPEN") {
      item.opens += 1;
    }

    if (
      event.type ===
      "CONVERSATION_STARTED"
    ) {
      item.conversations += 1;
    }
  }

  return series.map((item) => ({
    date: item.date,
    views: item.views,
    opens: item.opens,
    conversations: item.conversations,
  }));
}

export async function getWidgetAnalytics({
  workspaceId,
  periodDays = WIDGET_ANALYTICS_PERIOD_DAYS,
}: GetWidgetAnalyticsParams) {
  const periodStart = new Date();

  periodStart.setHours(0, 0, 0, 0);
  periodStart.setDate(
    periodStart.getDate() - periodDays + 1,
  );

  const [
    events,
    activeWebsiteChannels,
    websiteConversations,
    recentEvents,
  ] = await Promise.all([
    prisma.widgetEvent.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: periodStart,
        },
      },

      select: {
        id: true,
        type: true,
        visitorId: true,
        sessionId: true,
        pageUrl: true,
        referrer: true,
        createdAt: true,

        channel: {
          select: {
            id: true,
            name: true,

            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.channel.count({
      where: {
        type: "WEBSITE",
        isEnabled: true,

        employee: {
          workspaceId,
        },
      },
    }),

    prisma.conversation.findMany({
      where: {
        createdAt: {
          gte: periodStart,
        },

        channel: {
          type: "WEBSITE",

          employee: {
            workspaceId,
          },
        },
      },

      select: {
        id: true,
        contactId: true,

        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),

    prisma.widgetEvent.findMany({
      where: {
        workspaceId,
      },

      take: RECENT_EVENT_LIMIT,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        type: true,
        pageUrl: true,
        referrer: true,
        createdAt: true,

        channel: {
          select: {
            id: true,
            name: true,

            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const countByType = {
    VIEW: 0,
    OPEN: 0,
    CONVERSATION_STARTED: 0,
    USER_MESSAGE: 0,
    LEAD_CREATED: 0,
    AI_RESPONSE: 0,
  };

  for (const event of events) {
    countByType[event.type] += 1;
  }

  const uniqueVisitors = new Set(
    events
      .map(
        (event) =>
          event.visitorId ??
          event.sessionId,
      )
      .filter(
        (value): value is string =>
          Boolean(value),
      ),
  ).size;

  const contactsCreated = new Set(
    websiteConversations
      .map(
        (conversation) =>
          conversation.contactId,
      )
      .filter(
        (contactId): contactId is string =>
          Boolean(contactId),
      ),
  ).size;

  const totalConversationMessages =
    websiteConversations.reduce(
      (total, conversation) =>
        total +
        conversation._count.messages,
      0,
    );

  const averageMessagesPerConversation =
    websiteConversations.length > 0
      ? Number(
          (
            totalConversationMessages /
            websiteConversations.length
          ).toFixed(1),
        )
      : 0;

  const pageCounts = new Map<
    string,
    {
      pageUrl: string;
      label: string;
      views: number;
      opens: number;
      conversations: number;
    }
  >();

  for (const event of events) {
    if (!event.pageUrl) {
      continue;
    }

    const current = pageCounts.get(
      event.pageUrl,
    ) ?? {
      pageUrl: event.pageUrl,
      label: normalizePageLabel(
        event.pageUrl,
      ),
      views: 0,
      opens: 0,
      conversations: 0,
    };

    if (event.type === "VIEW") {
      current.views += 1;
    }

    if (event.type === "OPEN") {
      current.opens += 1;
    }

    if (
      event.type ===
      "CONVERSATION_STARTED"
    ) {
      current.conversations += 1;
    }

    pageCounts.set(
      event.pageUrl,
      current,
    );
  }

  const topPages = Array.from(
    pageCounts.values(),
  )
    .sort(
      (first, second) =>
        second.views - first.views,
    )
    .slice(0, TOP_PAGE_LIMIT)
    .map((page) => ({
      ...page,

      openRate: calculateRate(
        page.opens,
        page.views,
      ),

      conversationRate: calculateRate(
        page.conversations,
        page.opens,
      ),
    }));

  const referrerCounts =
    new Map<string, number>();

  for (const event of events) {
    if (event.type !== "VIEW") {
      continue;
    }

    const label =
      normalizeReferrerLabel(
        event.referrer,
      );

    referrerCounts.set(
      label,
      (referrerCounts.get(label) ?? 0) +
        1,
    );
  }

  const topReferrers = Array.from(
    referrerCounts.entries(),
  )
    .map(([label, views]) => ({
      label,
      views,
    }))
    .sort(
      (first, second) =>
        second.views - first.views,
    )
    .slice(0, TOP_REFERRER_LIMIT);

  return {
    periodDays,
    periodStart,

    overview: {
      uniqueVisitors,
      views: countByType.VIEW,
      opens: countByType.OPEN,
      conversations:
        countByType.CONVERSATION_STARTED,
      userMessages:
        countByType.USER_MESSAGE,
      aiResponses:
        countByType.AI_RESPONSE,
      leads: countByType.LEAD_CREATED,
      contactsCreated,
      activeWebsiteChannels,
      averageMessagesPerConversation,

      openRate: calculateRate(
        countByType.OPEN,
        countByType.VIEW,
      ),

      conversationRate: calculateRate(
        countByType.CONVERSATION_STARTED,
        countByType.OPEN,
      ),

      aiResponseRate: calculateRate(
        countByType.AI_RESPONSE,
        countByType.USER_MESSAGE,
      ),

      leadRate: calculateRate(
        countByType.LEAD_CREATED,
        countByType.CONVERSATION_STARTED,
      ),
    },

    funnel: [
      {
        key: "views" as const,
        value: countByType.VIEW,
      },
      {
        key: "opens" as const,
        value: countByType.OPEN,
      },
      {
        key: "conversations" as const,
        value:
          countByType.CONVERSATION_STARTED,
      },
      {
        key: "leads" as const,
        value: countByType.LEAD_CREATED,
      },
    ],

    dailyActivity: createDailySeries(
      events,
      periodDays,
    ),

    topPages,
    topReferrers,
    recentEvents,
  };
}

export type WidgetAnalytics = Awaited<
  ReturnType<typeof getWidgetAnalytics>
>;

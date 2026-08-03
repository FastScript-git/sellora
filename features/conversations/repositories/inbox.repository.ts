import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type InboxConversationStatus =
  | "ALL"
  | "OPEN"
  | "CLOSED";

type GetWorkspaceInboxParams = {
  workspaceId: string;
  search?: string;
  status?: InboxConversationStatus;
  employeeId?: string;
  channelId?: string;
};

export async function getWorkspaceInbox({
  workspaceId,
  search,
  status = "ALL",
  employeeId,
  channelId,
}: GetWorkspaceInboxParams) {
  const normalizedSearch = search?.trim();

  const where: Prisma.ConversationWhereInput = {
    employee: {
      workspaceId,
    },

    ...(status !== "ALL"
      ? {
          status,
        }
      : {}),

    ...(employeeId
      ? {
          employeeId,
        }
      : {}),

    ...(channelId
      ? {
          channelId,
        }
      : {}),

    ...(normalizedSearch
      ? {
          OR: [
            {
              title: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              contact: {
                is: {
                  OR: [
                    {
                      firstName: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                    {
                      lastName: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                    {
                      phone: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                    {
                      company: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
            {
              messages: {
                some: {
                  content: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  return prisma.conversation.findMany({
    where,

    orderBy: [
      {
        lastMessageAt: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],

    include: {
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },

      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          sentiment: true,
          leadScore: true,
        },
      },

      channel: {
        select: {
          id: true,
          type: true,
          name: true,
        },
      },

      assignedMember: {
        select: {
          id: true,
          role: true,

          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      },

      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
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
  });
}

type GetWorkspaceInboxFilterOptionsParams = {
  workspaceId: string;
};

export async function getWorkspaceInboxFilterOptions({
  workspaceId,
}: GetWorkspaceInboxFilterOptionsParams) {
  const conversations = await prisma.conversation.findMany({
    where: {
      employee: {
        workspaceId,
      },
    },

    select: {
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },

      channel: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  const employeesMap = new Map<
    string,
    {
      id: string;
      name: string;
      role: string;
    }
  >();

  const channelsMap = new Map<
    string,
    {
      id: string;
      name: string;
      type: string;
    }
  >();

  for (const conversation of conversations) {
    employeesMap.set(
      conversation.employee.id,
      conversation.employee,
    );

    if (conversation.channel) {
      channelsMap.set(
        conversation.channel.id,
        conversation.channel,
      );
    }
  }

  return {
    employees: Array.from(employeesMap.values()).sort(
      (firstEmployee, secondEmployee) =>
        firstEmployee.name.localeCompare(
          secondEmployee.name,
        ),
    ),

    channels: Array.from(channelsMap.values()).sort(
      (firstChannel, secondChannel) =>
        firstChannel.name.localeCompare(
          secondChannel.name,
        ),
    ),
  };
}

type GetWorkspaceInboxConversationParams = {
  workspaceId: string;
  conversationId: string;
};

export async function getWorkspaceInboxConversation({
  workspaceId,
  conversationId,
}: GetWorkspaceInboxConversationParams) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,

      employee: {
        workspaceId,
      },
    },

    include: {
      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },

      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          jobTitle: true,
          sentiment: true,
          leadScore: true,
          summary: true,
        },
      },

      channel: {
        select: {
          id: true,
          type: true,
          name: true,
        },
      },

      assignedMember: {
        select: {
          id: true,
          role: true,

          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      },

      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          role: true,
          content: true,
          metadata: true,
          createdAt: true,
        },
      },

      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
}
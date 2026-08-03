import { ChannelType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getEmployeeChannels(
  employeeId: string,
) {
  return prisma.channel.findMany({
    where: {
      employeeId,
    },

    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function createWebsiteChannel(
  employeeId: string,
) {
  return prisma.channel.create({
    data: {
      employeeId,
      type: ChannelType.WEBSITE,
      name: "Website Widget",
      widgetKey: crypto.randomUUID(),
    },
  });
}

export async function getWebsiteChannel({
  employeeId,
}: {
  employeeId: string;
}) {
  return prisma.channel.findFirst({
    where: {
      employeeId,
      type: ChannelType.WEBSITE,
    },
  });
}

type UpdateWebsiteChannelParams = {
  channelId: string;
  isEnabled: boolean;
  widgetTitle: string | null;
  widgetGreeting: string | null;
  widgetPrimaryColor: string;
  widgetPosition: string;
  allowedDomains: string[];
};

export async function updateWebsiteChannel({
  channelId,
  isEnabled,
  widgetTitle,
  widgetGreeting,
  widgetPrimaryColor,
  widgetPosition,
  allowedDomains,
}: UpdateWebsiteChannelParams) {
  return prisma.channel.update({
    where: {
      id: channelId,
    },

    data: {
      isEnabled,
      widgetTitle,
      widgetGreeting,
      widgetPrimaryColor,
      widgetPosition,
      allowedDomains,
    },
  });
}

type UpdateWebsiteChannelAllowedDomainsParams = {
  channelId: string;
  allowedDomains: string[];
};

export async function updateWebsiteChannelAllowedDomains({
  channelId,
  allowedDomains,
}: UpdateWebsiteChannelAllowedDomainsParams) {
  return prisma.channel.update({
    where: {
      id: channelId,
    },

    data: {
      allowedDomains,
    },
  });
}

export async function getWebsiteChannelSecurityConfig({
  widgetKey,
}: {
  widgetKey: string;
}) {
  return prisma.channel.findUnique({
    where: {
      widgetKey,
    },

    select: {
      id: true,
      type: true,
      isEnabled: true,
      allowedDomains: true,

      employee: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
}

export async function getWorkspaceChannels(
  workspaceId: string,
) {
  return prisma.channel.findMany({
    where: {
      employee: {
        workspaceId,
        status: {
          not: "ARCHIVED",
        },
      },
    },

    orderBy: [
      {
        isEnabled: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],

    select: {
      id: true,
      employeeId: true,
      type: true,
      name: true,
      widgetKey: true,
      widgetTitle: true,
      widgetGreeting: true,
      widgetPrimaryColor: true,
      widgetPosition: true,
      allowedDomains: true,
      isEnabled: true,
      createdAt: true,
      updatedAt: true,

      employee: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },

      _count: {
        select: {
          conversations: true,
          widgetEvents: true,
        },
      },
    },
  });
}

export async function getWorkspaceChannelEmployees(
  workspaceId: string,
) {
  return prisma.aIEmployee.findMany({
    where: {
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      role: true,
      status: true,

      _count: {
        select: {
          channels: true,
        },
      },
    },
  });
}

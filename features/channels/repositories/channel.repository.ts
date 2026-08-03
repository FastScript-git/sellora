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

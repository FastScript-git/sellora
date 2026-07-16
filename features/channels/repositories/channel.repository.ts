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

export async function updateWebsiteChannel({
  channelId,
  widgetTitle,
  widgetGreeting,
  widgetPrimaryColor,
  widgetPosition,
}: {
  channelId: string;
  widgetTitle: string | null;
  widgetGreeting: string | null;
  widgetPrimaryColor: string;
  widgetPosition: string;
}) {
  return prisma.channel.update({
    where: {
      id: channelId,
    },
    data: {
      widgetTitle,
      widgetGreeting,
      widgetPrimaryColor,
      widgetPosition,
    },
  });
}
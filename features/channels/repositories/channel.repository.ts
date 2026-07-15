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
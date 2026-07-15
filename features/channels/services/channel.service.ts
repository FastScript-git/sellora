import {
  createWebsiteChannel,
  getEmployeeChannels,
} from "@/features/channels/repositories/channel.repository";

export async function listEmployeeChannels(
  employeeId: string,
) {
  return getEmployeeChannels(employeeId);
}

export async function ensureWebsiteChannel(
  employeeId: string,
) {
  const channels = await getEmployeeChannels(employeeId);

  const existingWebsiteChannel = channels.find(
    (channel) => channel.type === "WEBSITE",
  );

  if (existingWebsiteChannel) {
    return existingWebsiteChannel;
  }

  return createWebsiteChannel(employeeId);
}
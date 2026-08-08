import type { AIEmployeeStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type UpdateAIEmployeeSettingsParams = {
  employeeId: string;
  workspaceId: string;
  name: string;
  role: string;
  status: AIEmployeeStatus;
};

export async function updateAIEmployeeSettings({
  employeeId,
  workspaceId,
  name,
  role,
  status,
}: UpdateAIEmployeeSettingsParams) {
  return prisma.aIEmployee.updateMany({
    where: {
      id: employeeId,
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },

    data: {
      name,
      role,
      status,
    },
  });
}

type ArchiveAIEmployeeParams = {
  employeeId: string;
  workspaceId: string;
};

export async function archiveAIEmployee({
  employeeId,
  workspaceId,
}: ArchiveAIEmployeeParams) {
  return prisma.aIEmployee.updateMany({
    where: {
      id: employeeId,
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },

    data: {
      status: "ARCHIVED",
    },
  });
}

import { prisma } from "@/lib/prisma";

type GetAIEmployeeParams = {
  employeeId: string;
  workspaceId: string;
};

export async function getAIEmployee({
  employeeId,
  workspaceId,
}: GetAIEmployeeParams) {
  return prisma.aIEmployee.findFirst({
    where: {
      id: employeeId,
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },
    select: {
      id: true,
      name: true,
      role: true,
      description: true,
      status: true,
      language: true,
      tone: true,
      identity: true,
      goals: true,
      rules: true,
      responseStyle: true,
      restrictions: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
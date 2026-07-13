import { prisma } from "@/lib/prisma";

type GetAIEmployeesParams = {
  workspaceId: string;
};

export async function getAIEmployees({
  workspaceId,
}: GetAIEmployeesParams) {
  return prisma.aIEmployee.findMany({
    where: {
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      role: true,
      description: true,
      status: true,
      language: true,
      tone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
import { prisma } from "@/lib/prisma";

export type AIEmployeeInstructionsData = {
  identity: string | null;
  goals: string | null;
  rules: string | null;
  responseStyle: string | null;
  restrictions: string | null;
};

type UpdateAIEmployeeInstructionsRecordParams = {
  employeeId: string;
  workspaceId: string;
  data: AIEmployeeInstructionsData;
};

export async function updateAIEmployeeInstructionsRecord({
  employeeId,
  workspaceId,
  data,
}: UpdateAIEmployeeInstructionsRecordParams) {
  const result = await prisma.aIEmployee.updateMany({
    where: {
      id: employeeId,
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },
    data,
  });

  return {
    updated: result.count === 1,
  };
}
import { prisma } from "@/lib/prisma";

type AIEmployeeBelongsToWorkspaceParams = {
  employeeId: string;
  workspaceId: string;
};

export async function aiEmployeeBelongsToWorkspace({
  employeeId,
  workspaceId,
}: AIEmployeeBelongsToWorkspaceParams) {
  const employee = await prisma.aIEmployee.findFirst({
    where: {
      id: employeeId,
      workspaceId,
      status: {
        not: "ARCHIVED",
      },
    },
    select: {
      id: true,
    },
  });

  return employee !== null;
}
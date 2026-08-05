import {
  AIEmployeeToolKey,
  type Prisma,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const AI_EMPLOYEE_TOOL_KEYS = [
  AIEmployeeToolKey.KNOWLEDGE_SEARCH,
  AIEmployeeToolKey.LEAD_COLLECTION,
  AIEmployeeToolKey.CONTACT_CREATION,
  AIEmployeeToolKey.HUMAN_HANDOFF,
  AIEmployeeToolKey.WEB_SEARCH,
  AIEmployeeToolKey.EMAIL,
  AIEmployeeToolKey.DOCUMENTS,
  AIEmployeeToolKey.CALENDAR,
  AIEmployeeToolKey.CRM,
  AIEmployeeToolKey.CUSTOM_API,
] as const;

type GetAIEmployeeToolsParams = {
  employeeId: string;
};

export async function getAIEmployeeTools({
  employeeId,
}: GetAIEmployeeToolsParams) {
  const storedTools =
    await prisma.aIEmployeeTool.findMany({
      where: {
        employeeId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const toolsByKey = new Map(
    storedTools.map((tool) => [
      tool.key,
      tool,
    ]),
  );

  return AI_EMPLOYEE_TOOL_KEYS.map(
    (key) => {
      const storedTool =
        toolsByKey.get(key);

      return {
        id: storedTool?.id ?? null,
        key,
        isEnabled:
          storedTool?.isEnabled ?? false,
        configuration:
          storedTool?.configuration ?? null,
      };
    },
  );
}

type UpdateAIEmployeeToolParams = {
  employeeId: string;
  key: AIEmployeeToolKey;
  isEnabled: boolean;
  configuration?:
    | Prisma.InputJsonValue
    | null;
};

export async function updateAIEmployeeTool({
  employeeId,
  key,
  isEnabled,
  configuration,
}: UpdateAIEmployeeToolParams) {
  return prisma.aIEmployeeTool.upsert({
    where: {
      employeeId_key: {
        employeeId,
        key,
      },
    },

    create: {
      employeeId,
      key,
      isEnabled,
      configuration:
        configuration ?? undefined,
    },

    update: {
      isEnabled,
      ...(configuration !== undefined
        ? {
            configuration:
              configuration ?? undefined,
          }
        : {}),
    },
  });
}

type AIEmployeeToolBelongsToWorkspaceParams = {
  employeeId: string;
  workspaceId: string;
};

export async function aiEmployeeToolBelongsToWorkspace({
  employeeId,
  workspaceId,
}: AIEmployeeToolBelongsToWorkspaceParams) {
  const employee =
    await prisma.aIEmployee.findFirst({
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

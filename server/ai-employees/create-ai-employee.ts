import { prisma } from "@/lib/prisma";
import type { AIEmployeeCreateInput } from "@/lib/validations/ai-employee";

type CreateAIEmployeeParams = {
  workspaceId: string;
  input: AIEmployeeCreateInput;
};

export async function createAIEmployee({
  workspaceId,
  input,
}: CreateAIEmployeeParams) {
  return prisma.aIEmployee.create({
    data: {
      workspaceId,
      name: input.name,
      role: input.role,
      description: input.description || null,
      language: input.language,
      tone: input.tone,
      status: "DRAFT",
    },
  });
}
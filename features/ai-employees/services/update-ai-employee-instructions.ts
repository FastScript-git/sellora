import {
  updateAIEmployeeInstructionsRecord,
  type AIEmployeeInstructionsData,
} from "@/features/ai-employees/repositories/ai-employee.repository";

type UpdateAIEmployeeInstructionsParams = {
  employeeId: string;
  workspaceId: string;
  data: AIEmployeeInstructionsData;
};

export async function updateAIEmployeeInstructions({
  employeeId,
  workspaceId,
  data,
}: UpdateAIEmployeeInstructionsParams) {
  const result = await updateAIEmployeeInstructionsRecord({
    employeeId,
    workspaceId,
    data,
  });

  if (!result.updated) {
    throw new Error(
      "AI Employee was not found or does not belong to this workspace.",
    );
  }

  return result;
}
"use server";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { generateResponse } from "@/features/ai/services/generate-response";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type SendMessageInput = {
  employeeId: string;
  message: string;
};

type SendMessageResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

const MAX_MESSAGE_LENGTH = 4000;

function buildEmployeeInstructions(employee: {
  role: string;
  language: string;
  tone: string | null;
  identity: string | null;
  goals: string | null;
  rules: string | null;
  responseStyle: string | null;
  restrictions: string | null;
}) {
  const sections = [
    `Role:\n${employee.role}`,
    `Language:\n${employee.language}`,
    employee.tone ? `Tone:\n${employee.tone}` : null,
    employee.identity
      ? `Identity:\n${employee.identity}`
      : null,
    employee.goals ? `Goals:\n${employee.goals}` : null,
    employee.rules ? `Rules:\n${employee.rules}` : null,
    employee.responseStyle
      ? `Response style:\n${employee.responseStyle}`
      : null,
    employee.restrictions
      ? `Restrictions:\n${employee.restrictions}`
      : null,
  ];

  return sections.filter(Boolean).join("\n\n");
}

export async function sendMessageAction({
  employeeId,
  message,
}: SendMessageInput): Promise<SendMessageResult> {
  const normalizedEmployeeId = employeeId.trim();
  const normalizedMessage = message.trim();

  if (!normalizedEmployeeId) {
    return {
      success: false,
      error: "AI Employee ID is required.",
    };
  }

  if (!normalizedMessage) {
    return {
      success: false,
      error: "Enter a message before sending.",
    };
  }

  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must contain at most ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  try {
    const workspace = await getCurrentWorkspace();

    const employee = await getAIEmployee({
      employeeId: normalizedEmployeeId,
      workspaceId: workspace.id,
    });

    if (!employee) {
      return {
        success: false,
        error: "AI Employee was not found in this workspace.",
      };
    }

    const instructions = buildEmployeeInstructions(employee);

    const response = await generateResponse({
      employeeName: employee.name,
      instructions,
      message: normalizedMessage,
    });

    const normalizedResponse = response.trim();

    if (!normalizedResponse) {
      return {
        success: false,
        error: "The AI Employee returned an empty response.",
      };
    }

    return {
      success: true,
      message: normalizedResponse,
    };
  } catch (error) {
    console.error("Failed to generate Test Chat response:", error);

    return {
      success: false,
      error:
        "Unable to generate a response. Check the OpenAI configuration and try again.",
    };
  }
}
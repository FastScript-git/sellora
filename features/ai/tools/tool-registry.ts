import "server-only";

import type OpenAI from "openai";

import {
  CALENDAR_TOOL_NAME,
  calendarToolDefinition,
  executeCalendarTool,
  type CalendarToolExecution,
} from "@/features/ai/tools/calendar-tool";
import {
  GMAIL_TOOL_NAME,
  executeGmailTool,
  gmailToolDefinition,
  type GmailToolExecution,
} from "@/features/ai/tools/gmail-tool";
import type { AIEmployeeToolKey } from "@/lib/generated/prisma/client";

type UnavailableToolExecution = {
  name: string;
  success: false;
  title: null;
  details: string;
};

export type AIToolExecution =
  | CalendarToolExecution
  | GmailToolExecution
  | UnavailableToolExecution;

type ToolResult = {
  output: string;
  execution: AIToolExecution;
};

type RegisteredTool = {
  key: AIEmployeeToolKey;
  name: string;
  definition:
    OpenAI.Responses.Tool;
  execute: (
    rawArguments: string,
  ) => Promise<ToolResult>;
};

const registeredTools: RegisteredTool[] =
  [
    {
      key: "CALENDAR",
      name: CALENDAR_TOOL_NAME,
      definition:
        calendarToolDefinition,
      execute:
        executeCalendarTool,
    },
    {
      key: "EMAIL",
      name: GMAIL_TOOL_NAME,
      definition:
        gmailToolDefinition,
      execute: executeGmailTool,
    },
  ];

export function getEnabledAITools(
  enabledKeys: AIEmployeeToolKey[],
) {
  const enabledKeySet =
    new Set(enabledKeys);

  return registeredTools.filter(
    (tool) =>
      enabledKeySet.has(tool.key),
  );
}

export function getAIToolDefinitions(
  enabledKeys: AIEmployeeToolKey[],
) {
  return getEnabledAITools(
    enabledKeys,
  ).map(
    (tool) => tool.definition,
  );
}

export async function executeRegisteredAITool({
  enabledKeys,
  name,
  rawArguments,
}: {
  enabledKeys:
    AIEmployeeToolKey[];
  name: string;
  rawArguments: string;
}): Promise<ToolResult> {
  const tool =
    getEnabledAITools(
      enabledKeys,
    ).find(
      (registeredTool) =>
        registeredTool.name ===
        name,
    );

  if (!tool) {
    return {
      output: JSON.stringify({
        success: false,
        error:
          "TOOL_NOT_AVAILABLE_OR_DISABLED",
      }),
      execution: {
        name,
        success: false,
        title: null,
        details:
          `Tool "${name}" is unavailable or disabled.`,
      },
    };
  }

  return tool.execute(
    rawArguments,
  );
}

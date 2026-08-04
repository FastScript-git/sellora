import "server-only";

import type OpenAI from "openai";

import {
  executeRegisteredAITool,
  getAIToolDefinitions,
  type AIToolExecution,
} from "@/features/ai/tools/tool-registry";
import type { AIEmployeeToolKey } from "@/lib/generated/prisma/client";
import { openai } from "@/lib/ai/openai";

const DEFAULT_RESPONSE_MODEL =
  "gpt-4.1-mini";

const MAX_TOOL_ROUNDS = 3;

type GenerateResponseWithToolsParams = {
  prompt: string;
  enabledToolKeys: AIEmployeeToolKey[];
};

type FunctionCallItem = {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
};

function isFunctionCallItem(
  item: unknown,
): item is FunctionCallItem {
  if (
    typeof item !== "object" ||
    item === null
  ) {
    return false;
  }

  const value = item as Record<
    string,
    unknown
  >;

  return (
    value.type === "function_call" &&
    typeof value.call_id === "string" &&
    typeof value.name === "string" &&
    typeof value.arguments === "string"
  );
}

function addUsage(
  current: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  },
  usage:
    | {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
      }
    | null
    | undefined,
) {
  return {
    inputTokens:
      current.inputTokens +
      (usage?.input_tokens ?? 0),

    outputTokens:
      current.outputTokens +
      (usage?.output_tokens ?? 0),

    totalTokens:
      current.totalTokens +
      (usage?.total_tokens ?? 0),
  };
}

export async function generateResponseWithTools({
  prompt,
  enabledToolKeys,
}: GenerateResponseWithToolsParams) {
  const normalizedPrompt =
    prompt.trim();

  if (!normalizedPrompt) {
    throw new Error(
      "AI prompt must not be empty.",
    );
  }

  const tools =
    getAIToolDefinitions(
      enabledToolKeys,
    );

  const currentDateTime =
    new Date().toISOString();

  const runtimeInstructions = [
    normalizedPrompt,
    "",
    "Tool execution rules:",
    `- Current server date and time: ${currentDateTime}.`,
    "- Default time zone: Europe/Kyiv.",
    "- Use tools only when the user clearly requests a real action.",
    "- Never claim that an action succeeded unless the tool result confirms success.",
    "- Ask a clarification question when required information is missing or ambiguous.",
    "- Never invent email addresses, dates, times, names, or external identifiers.",
    "- After a successful action, clearly summarize what was completed.",
    "- If an action fails, explain that it was not completed.",
  ].join("\n");

  const startedAt =
    performance.now();

  let response =
    await openai.responses.create({
      model: DEFAULT_RESPONSE_MODEL,
      input: runtimeInstructions,
      tools,
      tool_choice:
        tools.length > 0
          ? "auto"
          : "none",
    });

  let usage = addUsage(
    {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
    response.usage,
  );

  const toolExecutions:
    AIToolExecution[] = [];

  for (
    let round = 0;
    round < MAX_TOOL_ROUNDS;
    round += 1
  ) {
    const functionCalls =
      response.output.filter(
        isFunctionCallItem,
      );

    if (functionCalls.length === 0) {
      break;
    }

    const functionOutputs: OpenAI.Responses.ResponseInputItem[] =
      [];

    for (const call of functionCalls) {
      const result =
        await executeRegisteredAITool({
          enabledKeys:
            enabledToolKeys,
          name: call.name,
          rawArguments:
            call.arguments,
        });

      toolExecutions.push(
        result.execution,
      );

      functionOutputs.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: result.output,
      });
    }

    response =
      await openai.responses.create({
        model: DEFAULT_RESPONSE_MODEL,
        previous_response_id:
          response.id,
        input: functionOutputs,
        tools,
        tool_choice:
          tools.length > 0
            ? "auto"
            : "none",
      });

    usage = addUsage(
      usage,
      response.usage,
    );
  }

  return {
    text: response.output_text,
    model: DEFAULT_RESPONSE_MODEL,
    latencyMs: Math.round(
      performance.now() -
        startedAt,
    ),
    usage,
    toolExecutions,
  };
}

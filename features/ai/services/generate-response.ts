import { openai } from "@/lib/ai/openai";

const DEFAULT_RESPONSE_MODEL = "gpt-4.1-mini";

type GenerateResponseParams = {
  prompt: string;
};

export type GenerateResponseUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type GenerateResponseDetailedResult = {
  text: string;
  model: string;
  latencyMs: number;
  usage: GenerateResponseUsage;
};

export async function generateResponseDetailed({
  prompt,
}: GenerateResponseParams): Promise<GenerateResponseDetailedResult> {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("AI prompt must not be empty.");
  }

  const startedAt = performance.now();

  const response = await openai.responses.create({
    model: DEFAULT_RESPONSE_MODEL,
    input: normalizedPrompt,
  });

  const latencyMs = Math.round(
    performance.now() - startedAt,
  );

  const usage = response.usage;

  return {
    text: response.output_text,
    model: DEFAULT_RESPONSE_MODEL,
    latencyMs,
    usage: {
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    },
  };
}

export async function generateResponse({
  prompt,
}: GenerateResponseParams): Promise<string> {
  const result = await generateResponseDetailed({
    prompt,
  });

  return result.text;
}

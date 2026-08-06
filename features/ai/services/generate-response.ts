import { openai } from "@/lib/ai/openai";

const DEFAULT_RESPONSE_MODEL =
  "gpt-4.1-mini";

type GenerateResponseParams = {
  prompt: string;
};

type GenerateStreamingResponseParams = {
  prompt: string;
  signal?: AbortSignal;
  onDelta: (
    delta: string,
  ) => void | Promise<void>;
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

function normalizePrompt(prompt: string) {
  const normalizedPrompt =
    prompt.trim();

  if (!normalizedPrompt) {
    throw new Error(
      "AI prompt must not be empty.",
    );
  }

  return normalizedPrompt;
}

function normalizeUsage(
  usage:
    | {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
      }
    | null
    | undefined,
): GenerateResponseUsage {
  return {
    inputTokens:
      usage?.input_tokens ?? 0,
    outputTokens:
      usage?.output_tokens ?? 0,
    totalTokens:
      usage?.total_tokens ?? 0,
  };
}

export async function generateResponseDetailed({
  prompt,
}: GenerateResponseParams): Promise<GenerateResponseDetailedResult> {
  const normalizedPrompt =
    normalizePrompt(prompt);

  const startedAt =
    performance.now();

  const response =
    await openai.responses.create({
      model: DEFAULT_RESPONSE_MODEL,
      input: normalizedPrompt,
    });

  return {
    text: response.output_text,
    model: DEFAULT_RESPONSE_MODEL,
    latencyMs: Math.round(
      performance.now() - startedAt,
    ),
    usage: normalizeUsage(
      response.usage,
    ),
  };
}

export async function generateStreamingResponse({
  prompt,
  signal,
  onDelta,
}: GenerateStreamingResponseParams): Promise<GenerateResponseDetailedResult> {
  const normalizedPrompt =
    normalizePrompt(prompt);

  const startedAt =
    performance.now();

  const stream =
    await openai.responses.create(
      {
        model: DEFAULT_RESPONSE_MODEL,
        input: normalizedPrompt,
        stream: true,
      },
      {
        signal,
      },
    );

  let text = "";

  let usage:
    | {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
      }
    | null
    | undefined;

  for await (const event of stream) {
    if (
      event.type ===
      "response.output_text.delta"
    ) {
      if (!event.delta) {
        continue;
      }

      text += event.delta;

      await onDelta(event.delta);

      continue;
    }

    if (
      event.type ===
      "response.completed"
    ) {
      usage =
        event.response.usage;
    }
  }

  const normalizedText =
    text.trim();

  if (!normalizedText) {
    throw new Error(
      "AI_EMPTY_RESPONSE",
    );
  }

  return {
    text: normalizedText,
    model: DEFAULT_RESPONSE_MODEL,
    latencyMs: Math.round(
      performance.now() - startedAt,
    ),
    usage: normalizeUsage(usage),
  };
}

export async function generateResponse({
  prompt,
}: GenerateResponseParams): Promise<string> {
  const result =
    await generateResponseDetailed({
      prompt,
    });

  return result.text;
}

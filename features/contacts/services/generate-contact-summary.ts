import { z } from "zod";

import { generateResponse } from "@/features/ai/services/generate-response";

const contactIntelligenceSchema = z.object({
  summary: z.string().trim().min(1).max(2000),

  sentiment: z.enum([
    "POSITIVE",
    "NEUTRAL",
    "NEGATIVE",
  ]),

  leadScore: z.number().int().min(0).max(100),

  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(10),

  nextAction: z.string().trim().min(1).max(500),
});

export type GeneratedContactIntelligence = z.infer<
  typeof contactIntelligenceSchema
>;

type GenerateContactSummaryParams = {
  conversation: string;
};

function extractJson(value: string) {
  const normalizedValue = value.trim();

  if (
    normalizedValue.startsWith("{") &&
    normalizedValue.endsWith("}")
  ) {
    return normalizedValue;
  }

  const jsonStart = normalizedValue.indexOf("{");
  const jsonEnd = normalizedValue.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error(
      "AI response does not contain a valid JSON object.",
    );
  }

  return normalizedValue.slice(jsonStart, jsonEnd + 1);
}

export async function generateContactSummary({
  conversation,
}: GenerateContactSummaryParams): Promise<GeneratedContactIntelligence> {
  const normalizedConversation = conversation.trim();

  if (!normalizedConversation) {
    throw new Error(
      "Conversation is required for contact intelligence.",
    );
  }

  const prompt = `
You are an expert CRM analyst.

Analyze the customer conversation and return ONLY one valid JSON object.

Required JSON structure:

{
  "summary": "A concise factual summary of the customer's needs, questions and intent.",
  "sentiment": "POSITIVE",
  "leadScore": 0,
  "tags": ["tag"],
  "nextAction": "A specific recommended action for the business."
}

Rules:

- sentiment must be exactly POSITIVE, NEUTRAL or NEGATIVE.
- leadScore must be an integer from 0 to 100.
- tags must contain no more than 10 short strings.
- Do not invent facts that are absent from the conversation.
- Do not include Markdown or code fences.
- Return JSON only.

Conversation:

${normalizedConversation}
`.trim();

  const response = await generateResponse({
    prompt,
  });

  const json = extractJson(response);

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(json);
  } catch {
    throw new Error(
      "AI returned malformed contact intelligence JSON.",
    );
  }

  return contactIntelligenceSchema.parse(parsedJson);
}
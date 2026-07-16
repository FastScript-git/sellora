import { generateResponse } from "@/features/ai/services/generate-response";

type GenerateContactSummaryParams = {
  conversation: string;
};

export async function generateContactSummary({
  conversation,
}: GenerateContactSummaryParams) {
  const prompt = `
You are an expert CRM assistant.

Analyze this customer conversation.

Return ONLY valid JSON.

{
  "summary": "...",
  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "leadScore": 0,
  "tags": [],
  "nextAction": "..."
}

Conversation:

${conversation}
`;

  const response = await generateResponse({
    prompt,
  });

  return response;
}
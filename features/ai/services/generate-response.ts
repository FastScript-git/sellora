import { openai } from "@/lib/ai/openai";

type GenerateResponseParams = {
  prompt: string;
};

export async function generateResponse({
  prompt,
}: GenerateResponseParams) {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("AI prompt must not be empty.");
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: normalizedPrompt,
  });

  return response.output_text;
}
import { openai } from "@/lib/ai/openai";

type GenerateResponseParams = {
  employeeName: string;
  instructions?: string;
  message: string;
};

export async function generateResponse({
  employeeName,
  instructions,
  message,
}: GenerateResponseParams) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: instructions
          ? `You are an AI Employee named ${employeeName}.

${instructions}`
          : `You are an AI Employee named ${employeeName}.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return response.output_text;
}
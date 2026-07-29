import { openai } from "@/lib/ai/openai";

export type LeadPurchaseIntent =
  | "NONE"
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type LeadQualification = {
  leadScore: number;
  purchaseIntent: LeadPurchaseIntent;
  interest: string | null;
  nextAction: string | null;
  reason: string | null;
};

type OpenAILeadQualificationResponse = {
  leadScore?: unknown;
  purchaseIntent?: unknown;
  interest?: unknown;
  nextAction?: unknown;
  reason?: unknown;
};

const EMPTY_LEAD_QUALIFICATION: LeadQualification = {
  leadScore: 0,
  purchaseIntent: "NONE",
  interest: null,
  nextAction: null,
  reason: null,
};

function normalizeOptionalString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function normalizeLeadScore(
  value: unknown,
): number {
  if (typeof value !== "number") {
    return 0;
  }

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(value)),
  );
}

function normalizePurchaseIntent(
  value: unknown,
): LeadPurchaseIntent {
  if (typeof value !== "string") {
    return "NONE";
  }

  const normalizedValue = value
    .trim()
    .toUpperCase();

  if (
    normalizedValue === "LOW" ||
    normalizedValue === "MEDIUM" ||
    normalizedValue === "HIGH"
  ) {
    return normalizedValue;
  }

  return "NONE";
}

function removeMarkdownCodeFence(
  value: string,
): string {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseLeadQualification(
  rawResponse: string,
): LeadQualification {
  try {
    const cleanedResponse =
      removeMarkdownCodeFence(rawResponse);

    const parsedResponse = JSON.parse(
      cleanedResponse,
    ) as OpenAILeadQualificationResponse;

    return {
      leadScore: normalizeLeadScore(
        parsedResponse.leadScore,
      ),

      purchaseIntent: normalizePurchaseIntent(
        parsedResponse.purchaseIntent,
      ),

      interest: normalizeOptionalString(
        parsedResponse.interest,
      ),

      nextAction: normalizeOptionalString(
        parsedResponse.nextAction,
      ),

      reason: normalizeOptionalString(
        parsedResponse.reason,
      ),
    };
  } catch {
    return EMPTY_LEAD_QUALIFICATION;
  }
}

export async function qualifyLeadMessage(
  message: string,
): Promise<LeadQualification> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return EMPTY_LEAD_QUALIFICATION;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `
You qualify a potential sales lead from a single customer message.

Return only valid JSON with exactly these fields:

{
  "leadScore": number,
  "purchaseIntent": "NONE" | "LOW" | "MEDIUM" | "HIGH",
  "interest": string | null,
  "nextAction": string | null,
  "reason": string | null
}

Rules:

1. Analyze only information explicitly stated in the customer message.
2. Never invent budget, urgency, company size, authority, or buying intent.
3. leadScore must be an integer from 0 to 100.
4. Use a low score when the message is only a greeting or unrelated question.
5. Increase the score when the customer:
   - asks about pricing;
   - asks for a demo;
   - describes a business problem;
   - mentions urgency;
   - asks how to purchase;
   - requests a proposal;
   - provides business contact details;
   - clearly compares solutions before buying.
6. purchaseIntent meanings:
   - NONE: no visible buying intent;
   - LOW: general curiosity;
   - MEDIUM: evaluating a possible solution;
   - HIGH: actively preparing to buy or speak with sales.
7. interest must briefly describe what the customer appears interested in.
8. nextAction must be a practical action for the sales team or AI employee.
9. reason must briefly explain the score using only evidence from the message.
10. Preserve the customer's language for interest, nextAction, and reason.
11. Return null when there is not enough information.
12. Do not include markdown or explanations outside the JSON.

Examples:

Customer message:
"Привіт"

Result:
{
  "leadScore": 5,
  "purchaseIntent": "NONE",
  "interest": null,
  "nextAction": "Уточнити, чим можна допомогти клієнту.",
  "reason": "Повідомлення містить лише привітання."
}

Customer message:
"Скільки коштує ваш сервіс для команди з 10 менеджерів?"

Result:
{
  "leadScore": 65,
  "purchaseIntent": "MEDIUM",
  "interest": "Тариф для команди з 10 менеджерів.",
  "nextAction": "Уточнити потрібні функції та запропонувати відповідний тариф.",
  "reason": "Клієнт запитує ціну для конкретного розміру команди."
}

Customer message:
"Нам терміново потрібен AI-асистент для продажів. Хочемо демо цього тижня."

Result:
{
  "leadScore": 90,
  "purchaseIntent": "HIGH",
  "interest": "AI-асистент для автоматизації продажів.",
  "nextAction": "Запропонувати доступний час для демо цього тижня.",
  "reason": "Клієнт описав конкретну потребу, терміновість і попросив демо."
}
              `.trim(),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: normalizedMessage,
            },
          ],
        },
      ],
    });

    if (!response.output_text) {
      return EMPTY_LEAD_QUALIFICATION;
    }

    return parseLeadQualification(
      response.output_text,
    );
  } catch (error) {
    console.error(
      "Failed to qualify lead message:",
      error,
    );

    return EMPTY_LEAD_QUALIFICATION;
  }
}
import { openai } from "@/lib/ai/openai";

export type ExtractedContactDetails = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
};

type OpenAIContactExtractionResponse = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  jobTitle?: unknown;
};

const EMPTY_CONTACT_DETAILS: ExtractedContactDetails = {
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  company: null,
  jobTitle: null,
};

function normalizeOptionalString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue;
}

function normalizeEmail(
  value: unknown,
): string | null {
  const normalizedValue =
    normalizeOptionalString(value);

  if (!normalizedValue) {
    return null;
  }

  const normalizedEmail =
    normalizedValue.toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return null;
  }

  return normalizedEmail;
}

function normalizePhone(
  value: unknown,
): string | null {
  const normalizedValue =
    normalizeOptionalString(value);

  if (!normalizedValue) {
    return null;
  }

  const cleanedPhone = normalizedValue.replace(
    /[^\d+]/g,
    "",
  );

  const digitsOnly = cleanedPhone.replace(
    /\D/g,
    "",
  );

  if (
    digitsOnly.length < 7 ||
    digitsOnly.length > 15
  ) {
    return null;
  }

  return cleanedPhone;
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

function parseContactDetails(
  rawResponse: string,
): ExtractedContactDetails {
  try {
    const cleanedResponse =
      removeMarkdownCodeFence(rawResponse);

    const parsedResponse = JSON.parse(
      cleanedResponse,
    ) as OpenAIContactExtractionResponse;

    return {
      firstName: normalizeOptionalString(
        parsedResponse.firstName,
      ),
      lastName: normalizeOptionalString(
        parsedResponse.lastName,
      ),
      email: normalizeEmail(parsedResponse.email),
      phone: normalizePhone(parsedResponse.phone),
      company: normalizeOptionalString(
        parsedResponse.company,
      ),
      jobTitle: normalizeOptionalString(
        parsedResponse.jobTitle,
      ),
    };
  } catch {
    return EMPTY_CONTACT_DETAILS;
  }
}

export async function extractContactDetails(
  message: string,
): Promise<ExtractedContactDetails> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return EMPTY_CONTACT_DETAILS;
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
You extract contact information from a single customer message.

Return only valid JSON with exactly these fields:

{
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "company": string | null,
  "jobTitle": string | null
}

Rules:

1. Extract only information explicitly stated by the customer.
2. Never guess or invent information.
3. Do not treat ordinary words as names unless the customer clearly introduces themselves.
4. Keep names and company names in the original language.
5. Return null when a field is not present.
6. Do not include markdown.
7. Do not include explanations.
8. Do not include fields other than the six required fields.

Examples:

Customer message:
"My name is Yevhen."

Result:
{
  "firstName": "Yevhen",
  "lastName": null,
  "email": null,
  "phone": null,
  "company": null,
  "jobTitle": null
}

Customer message:
"Мене звати Євген Рибалка, моя пошта yevhen@example.com."

Result:
{
  "firstName": "Євген",
  "lastName": "Рибалка",
  "email": "yevhen@example.com",
  "phone": null,
  "company": null,
  "jobTitle": null
}

Customer message:
"I work at Acme as a sales manager."

Result:
{
  "firstName": null,
  "lastName": null,
  "email": null,
  "phone": null,
  "company": "Acme",
  "jobTitle": "sales manager"
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
      return EMPTY_CONTACT_DETAILS;
    }

    return parseContactDetails(
      response.output_text,
    );
  } catch (error) {
    console.error(
      "Failed to extract contact details:",
      error,
    );

    return EMPTY_CONTACT_DETAILS;
  }
}
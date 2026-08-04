import "server-only";

import { z } from "zod";

import { sendGmailMessage } from "@/features/integrations/gmail/gmail.service";

export const GMAIL_TOOL_NAME =
  "send_gmail_message";

export const gmailToolDefinition = {
  type: "function" as const,
  name: GMAIL_TOOL_NAME,
  description:
    "Send an email through the authenticated user's Gmail account. Use only when the user explicitly asks to send an email and provides a recipient email address.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      to: {
        type: "string",
        description:
          "Recipient email address. Never invent this value.",
      },
      subject: {
        type: "string",
        description:
          "Clear and concise email subject.",
      },
      body: {
        type: "string",
        description:
          "Complete plain-text email body ready to send.",
      },
    },
    required: [
      "to",
      "subject",
      "body",
    ],
  },
};

const gmailToolInputSchema =
  z.object({
    to: z
      .string()
      .trim()
      .email()
      .max(320),

    subject: z
      .string()
      .trim()
      .min(1)
      .max(200),

    body: z
      .string()
      .trim()
      .min(1)
      .max(20000),
  });

export type GmailToolExecution = {
  name: typeof GMAIL_TOOL_NAME;
  success: boolean;
  title: string | null;
  details: string;
  messageId: string | null;
};

export async function executeGmailTool(
  rawArguments: string,
): Promise<{
  output: string;
  execution: GmailToolExecution;
}> {
  let parsedJson: unknown;

  try {
    parsedJson =
      JSON.parse(rawArguments);
  } catch {
    const execution: GmailToolExecution = {
      name: GMAIL_TOOL_NAME,
      success: false,
      title: null,
      details:
        "Gmail tool arguments were not valid JSON.",
      messageId: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error:
          "INVALID_GMAIL_TOOL_ARGUMENTS",
      }),
      execution,
    };
  }

  const parsed =
    gmailToolInputSchema.safeParse(
      parsedJson,
    );

  if (!parsed.success) {
    const details =
      parsed.error.issues
        .map(
          (issue) =>
            `${issue.path.join(".")}: ${issue.message}`,
        )
        .join("; ");

    const execution: GmailToolExecution = {
      name: GMAIL_TOOL_NAME,
      success: false,
      title: null,
      details,
      messageId: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error:
          "INVALID_GMAIL_MESSAGE_DATA",
        details,
      }),
      execution,
    };
  }

  try {
    const message =
      await sendGmailMessage({
        to: parsed.data.to,
        subject:
          parsed.data.subject,
        body: parsed.data.body,
      });

    const execution: GmailToolExecution = {
      name: GMAIL_TOOL_NAME,
      success: true,
      title:
        parsed.data.subject,
      details:
        `Email sent to ${parsed.data.to}`,
      messageId: message.id,
    };

    return {
      output: JSON.stringify({
        success: true,
        messageId: message.id,
        threadId:
          message.threadId,
        to: parsed.data.to,
        subject:
          parsed.data.subject,
      }),
      execution,
    };
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message
        : "GMAIL_UNKNOWN_ERROR";

    const execution: GmailToolExecution = {
      name: GMAIL_TOOL_NAME,
      success: false,
      title:
        parsed.data.subject,
      details: errorCode,
      messageId: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error: errorCode,
      }),
      execution,
    };
  }
}

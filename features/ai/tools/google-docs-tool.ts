import "server-only";

import { z } from "zod";

import { createGoogleDocument } from "@/features/integrations/google-docs/google-docs.service";

export const GOOGLE_DOCS_TOOL_NAME =
  "create_google_document";

export const googleDocsToolDefinition = {
  type: "function" as const,
  name: GOOGLE_DOCS_TOOL_NAME,
  description:
    "Create a Google Docs document in the authenticated user's Google account. Use only when the user explicitly asks to create, draft, prepare, or save a document.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: {
        type: "string",
        description:
          "A short and descriptive document title.",
      },
      content: {
        type: "string",
        description:
          "The complete plain-text document content. IMPORTANT: write all Ukrainian and other non-ASCII characters as literal UTF-8 text. Never encode characters as Unicode escape sequences.",
      },
    },
    required: [
      "title",
      "content",
    ],
  },
};

const googleDocsToolInputSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(200),

    content: z
      .string()
      .trim()
      .min(1)
      .max(100000)
      .refine(
        (value) =>
          !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(
            value,
          ),
        {
          message:
            "Content contains invalid control characters. Retry using literal UTF-8 characters and do not use Unicode escape sequences.",
        },
      ),
  });

export type GoogleDocsToolExecution = {
  name: typeof GOOGLE_DOCS_TOOL_NAME;
  success: boolean;
  title: string | null;
  details: string;
  documentId: string | null;
  documentUrl: string | null;
};

export async function executeGoogleDocsTool(
  rawArguments: string,
): Promise<{
  output: string;
  execution: GoogleDocsToolExecution;
}> {
  let parsedJson: unknown;

  try {
    parsedJson =
      JSON.parse(rawArguments);
  } catch {
    const execution: GoogleDocsToolExecution = {
      name: GOOGLE_DOCS_TOOL_NAME,
      success: false,
      title: null,
      details:
        "Google Docs tool arguments were not valid JSON.",
      documentId: null,
      documentUrl: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error:
          "INVALID_GOOGLE_DOCS_TOOL_ARGUMENTS",
      }),
      execution,
    };
  }

  const parsed =
    googleDocsToolInputSchema.safeParse(
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

    const execution: GoogleDocsToolExecution = {
      name: GOOGLE_DOCS_TOOL_NAME,
      success: false,
      title: null,
      details,
      documentId: null,
      documentUrl: null,
    };

    return {
      output: JSON.stringify({
        success: false,
        error:
          "INVALID_GOOGLE_DOCUMENT_DATA",
        details,
        retryInstruction:
          "Call create_google_document again. Use literal UTF-8 characters for all Ukrainian text. Do not encode characters using Unicode escape sequences.",
      }),
      execution,
    };
  }

  try {
    const document =
      await createGoogleDocument({
        title: parsed.data.title,
        content: parsed.data.content,
      });

    const execution: GoogleDocsToolExecution = {
      name: GOOGLE_DOCS_TOOL_NAME,
      success: true,
      title: document.title,
      details:
        `Google document created: ${document.title}`,
      documentId: document.id,
      documentUrl: document.url,
    };

    return {
      output: JSON.stringify({
        success: true,
        documentId: document.id,
        documentUrl: document.url,
        title: document.title,
      }),
      execution,
    };
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message
        : "GOOGLE_DOCS_UNKNOWN_ERROR";

    const execution: GoogleDocsToolExecution = {
      name: GOOGLE_DOCS_TOOL_NAME,
      success: false,
      title: parsed.data.title,
      details: errorCode,
      documentId: null,
      documentUrl: null,
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

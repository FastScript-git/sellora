import "server-only";

import { google } from "googleapis";

import { getGoogleOAuthClient } from "@/features/integrations/google/google-oauth-client";

type CreateGoogleDocumentInput = {
  title: string;
  content: string;
};

function normalizeGoogleDocsText(
  value: string,
) {
  return value
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

export async function createGoogleDocument({
  title,
  content,
}: CreateGoogleDocumentInput) {
  const normalizedTitle =
    normalizeGoogleDocsText(title);

  const normalizedContent =
    normalizeGoogleDocsText(content);

  if (!normalizedTitle) {
    throw new Error(
      "GOOGLE_DOCUMENT_TITLE_REQUIRED",
    );
  }

  if (!normalizedContent) {
    throw new Error(
      "GOOGLE_DOCUMENT_CONTENT_REQUIRED",
    );
  }

  const oauth2Client =
    await getGoogleOAuthClient();

  const docs = google.docs({
    version: "v1",
    auth: oauth2Client,
  });

  const createdDocument =
    await docs.documents.create({
      requestBody: {
        title: normalizedTitle,
      },
    });

  const documentId =
    createdDocument.data.documentId;

  if (!documentId) {
    throw new Error(
      "GOOGLE_DOCUMENT_NOT_CREATED",
    );
  }

  try {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: `${normalizedContent}\n`,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(
      "Google document was created but content could not be inserted:",
      error,
    );

    throw new Error(
      "GOOGLE_DOCUMENT_CONTENT_NOT_INSERTED",
    );
  }

  return {
    id: documentId,
    title: normalizedTitle,
    url:
      `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

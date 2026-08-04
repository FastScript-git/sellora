import "server-only";

import { google } from "googleapis";

import { getGoogleOAuthClient } from "@/features/integrations/google/google-oauth-client";

type SendGmailMessageInput = {
  to: string;
  subject: string;
  body: string;
};

function removeHeaderLineBreaks(
  value: string,
) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeMimeHeader(
  value: string,
) {
  const encoded = Buffer.from(
    value,
    "utf8",
  ).toString("base64");

  return `=?UTF-8?B?${encoded}?=`;
}

function createRawEmail({
  to,
  subject,
  body,
}: SendGmailMessageInput) {
  const safeTo =
    removeHeaderLineBreaks(to);

  const safeSubject =
    removeHeaderLineBreaks(subject);

  const mimeMessage = [
    `To: ${safeTo}`,
    `Subject: ${encodeMimeHeader(safeSubject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(
      body,
      "utf8",
    ).toString("base64"),
  ].join("\r\n");

  return Buffer.from(
    mimeMessage,
    "utf8",
  ).toString("base64url");
}

export async function sendGmailMessage({
  to,
  subject,
  body,
}: SendGmailMessageInput) {
  const oauth2Client =
    await getGoogleOAuthClient();

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const response =
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: createRawEmail({
          to,
          subject,
          body,
        }),
      },
    });

  if (!response.data.id) {
    throw new Error(
      "GMAIL_MESSAGE_NOT_SENT",
    );
  }

  return {
    id: response.data.id,
    threadId:
      response.data.threadId ?? null,
    labelIds:
      response.data.labelIds ?? [],
  };
}

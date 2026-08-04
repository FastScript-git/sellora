import "server-only";

import {
  auth,
  clerkClient,
} from "@clerk/nextjs/server";
import { google } from "googleapis";

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

async function getGoogleOAuthAccessToken() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error(
      "AUTHENTICATION_REQUIRED",
    );
  }

  const client =
    await clerkClient();

  const response =
    await client.users.getUserOauthAccessToken(
      userId,
      "google",
    );

  const token =
    response.data[0]?.token;

  if (!token) {
    throw new Error(
      "GMAIL_NOT_CONNECTED",
    );
  }

  return token;
}

export async function sendGmailMessage({
  to,
  subject,
  body,
}: SendGmailMessageInput) {
  const accessToken =
    await getGoogleOAuthAccessToken();

  const oauth2Client =
    new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

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

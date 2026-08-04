import "server-only";

import {
  auth,
  clerkClient,
} from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function getGoogleOAuthClient() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error(
      "AUTHENTICATION_REQUIRED",
    );
  }

  const client = await clerkClient();

  const response =
    await client.users.getUserOauthAccessToken(
      userId,
      "google",
    );

  const accessToken =
    response.data[0]?.token;

  if (!accessToken) {
    throw new Error(
      "GOOGLE_ACCOUNT_NOT_CONNECTED",
    );
  }

  const oauth2Client =
    new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return oauth2Client;
}

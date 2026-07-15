import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { runKnowledgeIndexWorker } from "@/features/knowledge/services/run-knowledge-index-worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safelyCompareSecrets(
  receivedSecret: string,
  expectedSecret: string,
) {
  const receivedBuffer = Buffer.from(receivedSecret);
  const expectedBuffer = Buffer.from(expectedSecret);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured.");

    return NextResponse.json(
      {
        success: false,
        error: "Cron worker is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const receivedSecret = getBearerToken(request);

  if (
    !receivedSecret ||
    !safelyCompareSecrets(receivedSecret, cronSecret)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result = await runKnowledgeIndexWorker();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Knowledge cron worker failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Cron worker execution failed.",
      },
      {
        status: 500,
      },
    );
  }
}
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

export async function POST(request: Request) {
  const workerSecret = process.env.KNOWLEDGE_WORKER_SECRET;

  if (!workerSecret) {
    console.error(
      "KNOWLEDGE_WORKER_SECRET is not configured.",
    );

    return NextResponse.json(
      {
        success: false,
        error: "Worker is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const receivedSecret = getBearerToken(request);

  if (
    !receivedSecret ||
    !safelyCompareSecrets(receivedSecret, workerSecret)
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
    console.error("Knowledge index worker failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Worker execution failed.",
      },
      {
        status: 500,
      },
    );
  }
}
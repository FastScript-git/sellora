import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { createDocumentKnowledgeSourceWithJob } from "@/features/knowledge/repositories/knowledge.repository";
import { KnowledgeSourceType } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

const uploadPayloadSchema = z.object({
  employeeId: z.string().trim().min(1),

  title: z
    .string()
    .trim()
    .min(2)
    .max(120),

  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255),

  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_PDF_SIZE_BYTES),

  locale: z.enum(["en", "uk"]),
});

function normalizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function isValidPdfPathname({
  pathname,
  employeeId,
  fileName,
}: {
  pathname: string;
  employeeId: string;
  fileName: string;
}) {
  const expectedPrefix = `knowledge/${employeeId}/`;
  const normalizedFileName = normalizeFileName(fileName);

  return (
    pathname.startsWith(expectedPrefix) &&
    pathname.endsWith(`-${normalizedFileName}`) &&
    pathname.toLowerCase().endsWith(".pdf")
  );
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const response = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload,
      ) => {
        if (!clientPayload) {
          throw new Error("Upload metadata is missing.");
        }

        let rawPayload: unknown;

        try {
          rawPayload = JSON.parse(clientPayload);
        } catch {
          throw new Error("Upload metadata is invalid.");
        }

        const parsed =
          uploadPayloadSchema.safeParse(rawPayload);

        if (!parsed.success) {
          throw new Error("Upload metadata is invalid.");
        }

        const workspace = await getCurrentWorkspace();

        const hasAccess =
          await aiEmployeeBelongsToWorkspace({
            employeeId: parsed.data.employeeId,
            workspaceId: workspace.id,
          });

        if (!hasAccess) {
          throw new Error(
            "AI Employee was not found in this workspace.",
          );
        }

        if (
          !isValidPdfPathname({
            pathname,
            employeeId: parsed.data.employeeId,
            fileName: parsed.data.fileName,
          })
        ) {
          throw new Error("PDF pathname is invalid.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_PDF_SIZE_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify(parsed.data),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        if (!tokenPayload) {
          throw new Error(
            "Upload completion metadata is missing.",
          );
        }

        let rawPayload: unknown;

        try {
          rawPayload = JSON.parse(tokenPayload);
        } catch {
          throw new Error(
            "Upload completion metadata is invalid.",
          );
        }

        const parsed =
          uploadPayloadSchema.safeParse(rawPayload);

        if (!parsed.success) {
          throw new Error(
            "Upload completion metadata is invalid.",
          );
        }

        if (
          !isValidPdfPathname({
            pathname: blob.pathname,
            employeeId: parsed.data.employeeId,
            fileName: parsed.data.fileName,
          })
        ) {
          throw new Error(
            "Uploaded PDF pathname is invalid.",
          );
        }

        try {
          await createDocumentKnowledgeSourceWithJob({
            employeeId: parsed.data.employeeId,
            type: KnowledgeSourceType.PDF,
            title: parsed.data.title,
            storageKey: blob.pathname,
            fileName: parsed.data.fileName,
            mimeType: "application/pdf",
            fileSizeBytes: parsed.data.fileSizeBytes,
          });
        } catch (error) {
          const duplicateStorageKey =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002";

          // Vercel may retry completion callbacks.
          // A duplicate storageKey means the first callback succeeded.
          if (duplicateStorageKey) {
            return;
          }

          console.error(
            "Failed to persist uploaded PDF:",
            error,
          );

          throw new Error(
            "Uploaded PDF could not be saved.",
          );
        }
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("PDF upload route failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "PDF upload failed.",
      },
      {
        status: 400,
      },
    );
  }
}
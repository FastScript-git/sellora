import { del, get } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const MAX_KNOWLEDGE_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export async function deleteBlob(pathname: string) {
  await del(pathname);
}

export async function readPrivateBlob(
  pathname: string,
): Promise<Uint8Array> {
  const normalizedPathname = pathname.trim();

  if (!normalizedPathname) {
    throw new Error("Blob pathname is required.");
  }

  const result = await get(normalizedPathname, {
    access: "private",
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Private blob was not found.");
  }

  const contentLength = result.blob.size;

  if (
    typeof contentLength === "number" &&
    contentLength > MAX_KNOWLEDGE_FILE_SIZE_BYTES
  ) {
    throw new Error(
      "Knowledge file exceeds the maximum allowed size.",
    );
  }

  const arrayBuffer = await new Response(
    result.stream,
  ).arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("Private blob is empty.");
  }

  if (
    arrayBuffer.byteLength >
    MAX_KNOWLEDGE_FILE_SIZE_BYTES
  ) {
    throw new Error(
      "Knowledge file exceeds the maximum allowed size.",
    );
  }

  return new Uint8Array(arrayBuffer);
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export function createKnowledgeBlobPath(
  employeeId: string,
  fileName: string,
) {
  const safeFileName = sanitizeFileName(fileName);

  return [
    "knowledge",
    employeeId,
    `${randomUUID()}-${safeFileName}`,
  ].join("/");
}

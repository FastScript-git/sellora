import { del } from "@vercel/blob";
import { randomUUID } from "node:crypto";

export async function deleteBlob(pathname: string) {
  await del(pathname);
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
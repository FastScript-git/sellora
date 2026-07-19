import type { KnowledgeSourceType } from "@/lib/generated/prisma/client";

import {
  createKnowledgeSource,
  deleteKnowledgeSource,
  getKnowledgeSources,
} from "@/features/knowledge/repositories/knowledge.repository";

type CreateKnowledgeSourceParams = {
  employeeId: string;
  type: KnowledgeSourceType;
  title: string;
  sourceUrl?: string | null;
  content?: string | null;
  storageKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
};

export async function createKnowledge({
  employeeId,
  type,
  title,
  sourceUrl,
  content,
  storageKey,
  fileName,
  mimeType,
  fileSizeBytes,
}: CreateKnowledgeSourceParams) {
  return createKnowledgeSource({
    employeeId,
    type,
    title,
    sourceUrl,
    content,
    storageKey,
    fileName,
    mimeType,
    fileSizeBytes,
  });
}

export async function listKnowledge(employeeId: string) {
  return getKnowledgeSources(employeeId);
}

export async function removeKnowledge(id: string) {
  return deleteKnowledgeSource(id);
}
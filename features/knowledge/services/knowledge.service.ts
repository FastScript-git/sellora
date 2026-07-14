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
};

export async function createKnowledge({
  employeeId,
  type,
  title,
  sourceUrl,
  content,
}: CreateKnowledgeSourceParams) {
  return createKnowledgeSource({
    employeeId,
    type,
    title,
    sourceUrl,
    content,
  });
}

export async function listKnowledge(employeeId: string) {
  return getKnowledgeSources(employeeId);
}

export async function removeKnowledge(id: string) {
  return deleteKnowledgeSource(id);
}
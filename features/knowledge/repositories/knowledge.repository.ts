import type {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateKnowledgeSourceData = {
  employeeId: string;
  type: KnowledgeSourceType;
  title: string;
  sourceUrl?: string | null;
  content?: string | null;
};

export async function createKnowledgeSource(
  data: CreateKnowledgeSourceData,
) {
  return prisma.knowledgeSource.create({
    data,
  });
}

export async function getKnowledgeSources(employeeId: string) {
  return prisma.knowledgeSource.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateKnowledgeSourceStatus({
  sourceId,
  status,
  content,
}: {
  sourceId: string;
  status: KnowledgeSourceStatus;
  content?: string | null;
}) {
  return prisma.knowledgeSource.update({
    where: {
      id: sourceId,
    },
    data: {
      status,
      ...(content !== undefined ? { content } : {}),
    },
  });
}

export async function deleteKnowledgeSource(id: string) {
  return prisma.knowledgeSource.delete({
    where: {
      id,
    },
  });
}
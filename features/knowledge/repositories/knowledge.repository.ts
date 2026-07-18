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

type GetKnowledgeSourceForEmployeeParams = {
  sourceId: string;
  employeeId: string;
};

export async function createKnowledgeSource(
  data: CreateKnowledgeSourceData,
) {
  return prisma.knowledgeSource.create({
    data,
  });
}

export async function getKnowledgeSources(
  employeeId: string,
) {
  return prisma.knowledgeSource.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          chunks: true,
        },
      },
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

export async function getKnowledgeSourceById(
  id: string,
) {
  return prisma.knowledgeSource.findUnique({
    where: {
      id,
    },
    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
      },
      _count: {
        select: {
          chunks: true,
          indexJobs: true,
        },
      },
    },
  });
}

export async function getKnowledgeSourceForEmployee({
  sourceId,
  employeeId,
}: GetKnowledgeSourceForEmployeeParams) {
  return prisma.knowledgeSource.findFirst({
    where: {
      id: sourceId,
      employeeId,
    },
    select: {
      id: true,
      employeeId: true,
      type: true,
      title: true,
      status: true,
    },
  });
}
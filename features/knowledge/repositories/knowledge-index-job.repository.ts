import {
  KnowledgeIndexJobStatus,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function createKnowledgeIndexJob(
  knowledgeSourceId: string,
) {
  return prisma.knowledgeIndexJob.create({
    data: {
      knowledgeSourceId,
    },
  });
}

export async function getNextPendingKnowledgeIndexJob() {
  return prisma.knowledgeIndexJob.findFirst({
    where: {
      status: KnowledgeIndexJobStatus.PENDING,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      knowledgeSource: true,
    },
  });
}

export async function markKnowledgeIndexJobProcessing(
  id: string,
) {
  return prisma.knowledgeIndexJob.update({
    where: {
      id,
    },
    data: {
      status: KnowledgeIndexJobStatus.PROCESSING,
      startedAt: new Date(),
      attempts: {
        increment: 1,
      },
    },
  });
}

export async function markKnowledgeIndexJobCompleted(
  id: string,
) {
  return prisma.knowledgeIndexJob.update({
    where: {
      id,
    },
    data: {
      status: KnowledgeIndexJobStatus.COMPLETED,
      finishedAt: new Date(),
      error: null,
    },
  });
}

export async function markKnowledgeIndexJobFailed(
  id: string,
  error: string,
) {
  return prisma.knowledgeIndexJob.update({
    where: {
      id,
    },
    data: {
      status: KnowledgeIndexJobStatus.FAILED,
      finishedAt: new Date(),
      error,
    },
  });
}
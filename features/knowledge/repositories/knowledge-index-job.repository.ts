import {
  KnowledgeIndexJobStatus,
  type KnowledgeSource,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ClaimedKnowledgeIndexJob = {
  id: string;
  knowledgeSourceId: string;
  attempts: number;
  knowledgeSource: KnowledgeSource;
};

type ClaimedJobRow = {
  id: string;
  knowledgeSourceId: string;
  attempts: number;
};

export async function createKnowledgeIndexJob(
  knowledgeSourceId: string,
) {
  return prisma.knowledgeIndexJob.create({
    data: {
      knowledgeSourceId,
    },
  });
}

export async function claimNextPendingKnowledgeIndexJob(): Promise<
  ClaimedKnowledgeIndexJob | null
> {
  return prisma.$transaction(async (transaction) => {
    const rows = await transaction.$queryRaw<ClaimedJobRow[]>`
      WITH next_job AS (
        SELECT "id"
        FROM "KnowledgeIndexJob"
        WHERE "status" = 'PENDING'::"KnowledgeIndexJobStatus"
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE "KnowledgeIndexJob" AS job
      SET
        "status" = 'PROCESSING'::"KnowledgeIndexJobStatus",
        "startedAt" = NOW(),
        "finishedAt" = NULL,
        "error" = NULL,
        "attempts" = job."attempts" + 1,
        "updatedAt" = NOW()
      FROM next_job
      WHERE job."id" = next_job."id"
      RETURNING
        job."id",
        job."knowledgeSourceId",
        job."attempts"
    `;

    const claimedJob = rows[0];

    if (!claimedJob) {
      return null;
    }

    const knowledgeSource =
      await transaction.knowledgeSource.findUnique({
        where: {
          id: claimedJob.knowledgeSourceId,
        },
      });

    if (!knowledgeSource) {
      await transaction.knowledgeIndexJob.update({
        where: {
          id: claimedJob.id,
        },
        data: {
          status: KnowledgeIndexJobStatus.FAILED,
          finishedAt: new Date(),
          error: "Knowledge source was not found.",
        },
      });

      return null;
    }

    return {
      ...claimedJob,
      knowledgeSource,
    };
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
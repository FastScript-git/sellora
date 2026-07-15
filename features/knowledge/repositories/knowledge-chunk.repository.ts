import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";

const EMBEDDING_DIMENSIONS = 1536;

export type KnowledgeChunkRecord = {
  chunkIndex: number;
  content: string;
  embedding: number[];
  tokenCount?: number | null;
  metadata?: Record<string, unknown> | null;
};

type ReplaceKnowledgeChunksParams = {
  knowledgeSourceId: string;
  chunks: KnowledgeChunkRecord[];
};

function serializeEmbedding(embedding: number[]) {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding must contain exactly ${EMBEDDING_DIMENSIONS} dimensions.`,
    );
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("Embedding contains an invalid numeric value.");
  }

  return `[${embedding.join(",")}]`;
}

export async function replaceKnowledgeChunks({
  knowledgeSourceId,
  chunks,
}: ReplaceKnowledgeChunksParams) {
  return prisma.$transaction(async (transaction) => {
    await transaction.knowledgeChunk.deleteMany({
      where: {
        knowledgeSourceId,
      },
    });

    for (const chunk of chunks) {
      const embedding = serializeEmbedding(chunk.embedding);
      const metadata = JSON.stringify(chunk.metadata ?? {});

      await transaction.$executeRaw`
        INSERT INTO "KnowledgeChunk" (
          "id",
          "knowledgeSourceId",
          "chunkIndex",
          "content",
          "embedding",
          "tokenCount",
          "metadata",
          "createdAt"
        )
        VALUES (
          ${randomUUID()},
          ${knowledgeSourceId},
          ${chunk.chunkIndex},
          ${chunk.content},
          ${embedding}::vector,
          ${chunk.tokenCount ?? null},
          ${metadata}::jsonb,
          NOW()
        )
      `;
    }

    return {
      count: chunks.length,
    };
  });
}
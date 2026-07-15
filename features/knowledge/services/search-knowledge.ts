import { generateEmbeddings } from "@/features/knowledge/services/generate-embeddings";
import { prisma } from "@/lib/prisma";

const EMBEDDING_DIMENSIONS = 1536;
const DEFAULT_RESULT_LIMIT = 5;
const MAX_RESULT_LIMIT = 10;

type SearchKnowledgeParams = {
  employeeId: string;
  query: string;
  limit?: number;
};

export type KnowledgeSearchResult = {
  id: string;
  knowledgeSourceId: string;
  sourceTitle: string;
  content: string;
  chunkIndex: number;
  similarity: number;
};

type KnowledgeSearchRow = {
  id: string;
  knowledgeSourceId: string;
  sourceTitle: string;
  content: string;
  chunkIndex: number;
  similarity: number;
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

export async function searchKnowledge({
  employeeId,
  query,
  limit = DEFAULT_RESULT_LIMIT,
}: SearchKnowledgeParams): Promise<KnowledgeSearchResult[]> {
  const normalizedEmployeeId = employeeId.trim();
  const normalizedQuery = query.trim();

  if (!normalizedEmployeeId) {
    throw new Error("AI Employee ID is required.");
  }

  if (!normalizedQuery) {
    return [];
  }

  const safeLimit = Math.min(
    Math.max(Math.trunc(limit), 1),
    MAX_RESULT_LIMIT,
  );

  const generatedEmbeddings = await generateEmbeddings({
    texts: [normalizedQuery],
  });

  const queryEmbedding = generatedEmbeddings[0]?.embedding;

  if (!queryEmbedding) {
    throw new Error("Unable to generate the query embedding.");
  }

  const serializedEmbedding = serializeEmbedding(queryEmbedding);

  const rows = await prisma.$queryRaw<KnowledgeSearchRow[]>`
    SELECT
      chunk."id",
      chunk."knowledgeSourceId",
      source."title" AS "sourceTitle",
      chunk."content",
      chunk."chunkIndex",
      (
        1 - (
          chunk."embedding" <=> ${serializedEmbedding}::vector
        )
      )::double precision AS "similarity"
    FROM "KnowledgeChunk" AS chunk
    INNER JOIN "KnowledgeSource" AS source
      ON source."id" = chunk."knowledgeSourceId"
    WHERE
      source."employeeId" = ${normalizedEmployeeId}
      AND source."status" = 'INDEXED'::"KnowledgeSourceStatus"
      AND chunk."embedding" IS NOT NULL
    ORDER BY
      chunk."embedding" <=> ${serializedEmbedding}::vector
    LIMIT ${safeLimit}
  `;

  return rows.map((row) => ({
    ...row,
    similarity: Number(row.similarity),
  }));
}
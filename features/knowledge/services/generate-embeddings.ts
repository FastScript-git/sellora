import { openai } from "@/lib/ai/openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_BATCH_SIZE = 100;

type GenerateEmbeddingsParams = {
  texts: string[];
};

export type GeneratedEmbedding = {
  index: number;
  embedding: number[];
};

export async function generateEmbeddings({
  texts,
}: GenerateEmbeddingsParams): Promise<GeneratedEmbedding[]> {
  const normalizedTexts = texts
    .map((text) => text.trim())
    .filter((text) => text.length > 0);

  if (normalizedTexts.length === 0) {
    return [];
  }

  const embeddings: GeneratedEmbedding[] = [];

  for (
    let batchStart = 0;
    batchStart < normalizedTexts.length;
    batchStart += MAX_BATCH_SIZE
  ) {
    const batch = normalizedTexts.slice(
      batchStart,
      batchStart + MAX_BATCH_SIZE,
    );

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      encoding_format: "float",
    });

    const orderedBatch = [...response.data].sort(
      (first, second) => first.index - second.index,
    );

    for (const item of orderedBatch) {
      embeddings.push({
        index: batchStart + item.index,
        embedding: item.embedding,
      });
    }
  }

  if (embeddings.length !== normalizedTexts.length) {
    throw new Error(
      "OpenAI returned an unexpected number of embeddings.",
    );
  }

  return embeddings;
}
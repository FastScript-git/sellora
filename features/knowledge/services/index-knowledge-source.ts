import { chunkText } from "@/features/knowledge/services/chunk-text";
import { generateEmbeddings } from "@/features/knowledge/services/generate-embeddings";
import {
  replaceKnowledgeChunks,
} from "@/features/knowledge/repositories/knowledge-chunk.repository";

type IndexKnowledgeSourceParams = {
  knowledgeSourceId: string;
  content: string;
};

export async function indexKnowledgeSource({
  knowledgeSourceId,
  content,
}: IndexKnowledgeSourceParams) {
  const chunks = chunkText(content);

  if (chunks.length === 0) {
    throw new Error("No chunks were generated.");
  }

  const embeddings = await generateEmbeddings({
    texts: chunks.map((chunk) => chunk.content),
  });

  await replaceKnowledgeChunks({
    knowledgeSourceId,
    chunks: chunks.map((chunk) => ({
      chunkIndex: chunk.index,
      content: chunk.content,
      embedding: embeddings[chunk.index].embedding,
      tokenCount: undefined,
      metadata: {
        characterCount: chunk.characterCount,
      },
    })),
  });

  return {
    chunkCount: chunks.length,
  };
}
import { indexKnowledgeSource } from "@/features/knowledge/services/index-knowledge-source";

type IndexNoteSourceParams = {
  knowledgeSourceId: string;
  content: string;
};

export async function indexNoteSource({
  knowledgeSourceId,
  content,
}: IndexNoteSourceParams) {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    throw new Error(
      "Note knowledge source does not contain any content.",
    );
  }

  return indexKnowledgeSource({
    knowledgeSourceId,
    content: normalizedContent,
  });
}
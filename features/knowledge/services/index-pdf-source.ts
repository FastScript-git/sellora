import { extractPdfText } from "@/features/knowledge/services/extract-pdf-text";
import { indexKnowledgeSource } from "@/features/knowledge/services/index-knowledge-source";

type IndexPdfSourceParams = {
  knowledgeSourceId: string;
  storageKey: string;
};

export async function indexPdfSource({
  knowledgeSourceId,
  storageKey,
}: IndexPdfSourceParams) {
  const content = await extractPdfText({
    storageKey,
  });

  return indexKnowledgeSource({
    knowledgeSourceId,
    content,
  });
}

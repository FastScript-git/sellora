import { processWebsiteSource } from "@/features/knowledge/services/process-website-source";
import { indexKnowledgeSource } from "@/features/knowledge/services/index-knowledge-source";

type IndexWebsiteSourceParams = {
  knowledgeSourceId: string;
  url: string;
};

export async function indexWebsiteSource({
  knowledgeSourceId,
  url,
}: IndexWebsiteSourceParams) {
  const website = await processWebsiteSource({
    url,
  });

  const result = await indexKnowledgeSource({
    knowledgeSourceId,
    content: website.text,
  });

  return {
    title: website.title,
    description: website.description,
    chunkCount: result.chunkCount,
  };
}
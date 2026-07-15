import { fetchWebsite } from "@/features/knowledge/services/fetch-website";
import { extractWebsiteContent } from "@/features/knowledge/services/extract-website-content";

type ProcessWebsiteSourceParams = {
  url: string;
};

export async function processWebsiteSource({
  url,
}: ProcessWebsiteSourceParams) {
  const html = await fetchWebsite({
    url,
  });

  const content = extractWebsiteContent(html);

  return {
    html,
    ...content,
  };
}
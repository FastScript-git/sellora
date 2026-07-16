import { getKnowledgeSources as getKnowledgeSourcesFromRepository } from "@/features/knowledge/repositories/knowledge.repository";

type GetKnowledgeSourcesParams = {
  employeeId: string;
};

export async function getKnowledgeSources({
  employeeId,
}: GetKnowledgeSourcesParams) {
  return getKnowledgeSourcesFromRepository(employeeId);
}
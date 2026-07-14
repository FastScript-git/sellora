import { prisma } from "@/lib/prisma";

type GetKnowledgeSourcesParams = {
  employeeId: string;
};

export async function getKnowledgeSources({
  employeeId,
}: GetKnowledgeSourcesParams) {
  return prisma.knowledgeSource.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
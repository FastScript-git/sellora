import {
  markKnowledgeIndexJobCompleted,
  markKnowledgeIndexJobFailed,
} from "@/features/knowledge/repositories/knowledge-index-job.repository";
import { updateKnowledgeSourceStatus } from "@/features/knowledge/repositories/knowledge.repository";
import { indexKnowledgeSource } from "@/features/knowledge/services/index-knowledge-source";
import { indexPdfSource } from "@/features/knowledge/services/index-pdf-source";
import { indexWebsiteSource } from "@/features/knowledge/services/index-website-source";
import {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  type KnowledgeSource,
} from "@/lib/generated/prisma/client";

type ProcessKnowledgeIndexJobParams = {
  job: {
    id: string;
    attempts: number;
    knowledgeSource: KnowledgeSource;
  };
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 2000);
  }

  return "Unknown indexing error.";
}

export async function processKnowledgeIndexJob({
  job,
}: ProcessKnowledgeIndexJobParams) {
  const source = job.knowledgeSource;

  try {
    await updateKnowledgeSourceStatus({
      sourceId: source.id,
      status: KnowledgeSourceStatus.INDEXING,
    });

    switch (source.type) {
      case KnowledgeSourceType.WEBSITE: {
        if (!source.sourceUrl) {
          throw new Error(
            "Website knowledge source does not contain a URL.",
          );
        }

        await indexWebsiteSource({
          knowledgeSourceId: source.id,
          url: source.sourceUrl,
        });

        break;
      }

      case KnowledgeSourceType.NOTE: {
        if (!source.content) {
          throw new Error(
            "Note knowledge source does not contain any content.",
          );
        }

        await indexKnowledgeSource({
          knowledgeSourceId: source.id,
          content: source.content,
        });

        break;
      }

      case KnowledgeSourceType.PDF: {
        if (!source.storageKey) {
          throw new Error(
            "PDF knowledge source does not contain a storage key.",
          );
        }

        await indexPdfSource({
          knowledgeSourceId: source.id,
          storageKey: source.storageKey,
        });

        break;
      }

      case KnowledgeSourceType.FAQ:
        throw new Error(
          "FAQ indexing is not implemented yet.",
        );

      default: {
        const unsupportedType: never = source.type;

        throw new Error(
          `Unsupported knowledge source type: ${unsupportedType}`,
        );
      }
    }

    await updateKnowledgeSourceStatus({
      sourceId: source.id,
      status: KnowledgeSourceStatus.INDEXED,
    });

    await markKnowledgeIndexJobCompleted(job.id);

    return {
      success: true as const,
      jobId: job.id,
      knowledgeSourceId: source.id,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    console.error("Knowledge indexing job failed:", {
      jobId: job.id,
      knowledgeSourceId: source.id,
      attempts: job.attempts,
      error,
    });

    await updateKnowledgeSourceStatus({
      sourceId: source.id,
      status: KnowledgeSourceStatus.FAILED,
    });

    await markKnowledgeIndexJobFailed(
      job.id,
      errorMessage,
    );

    return {
      success: false as const,
      jobId: job.id,
      knowledgeSourceId: source.id,
      error: errorMessage,
    };
  }
}

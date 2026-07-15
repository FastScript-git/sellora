import { claimNextPendingKnowledgeIndexJob } from "@/features/knowledge/repositories/knowledge-index-job.repository";
import { processKnowledgeIndexJob } from "@/features/knowledge/services/process-knowledge-index-job";

export async function runKnowledgeIndexWorker() {
  const job = await claimNextPendingKnowledgeIndexJob();

  if (!job) {
    return {
      processed: false as const,
      reason: "NO_PENDING_JOBS" as const,
    };
  }

  const result = await processKnowledgeIndexJob({
    job,
  });

  return {
    processed: true as const,
    result,
  };
}
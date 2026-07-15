import { claimNextPendingKnowledgeIndexJob } from "@/features/knowledge/repositories/knowledge-index-job.repository";
import { processKnowledgeIndexJob } from "@/features/knowledge/services/process-knowledge-index-job";

const DEFAULT_MAX_JOBS = 5;
const MAX_ALLOWED_JOBS = 20;

type RunKnowledgeIndexWorkerParams = {
  maxJobs?: number;
};

export async function runKnowledgeIndexWorker({
  maxJobs = DEFAULT_MAX_JOBS,
}: RunKnowledgeIndexWorkerParams = {}) {
  const safeMaxJobs = Math.min(
    Math.max(Math.trunc(maxJobs), 1),
    MAX_ALLOWED_JOBS,
  );

  const results = [];

  for (let index = 0; index < safeMaxJobs; index += 1) {
    const job = await claimNextPendingKnowledgeIndexJob();

    if (!job) {
      break;
    }

    const result = await processKnowledgeIndexJob({
      job,
    });

    results.push(result);
  }

  return {
    processed: results.length > 0,
    processedCount: results.length,
    results,
    reason:
      results.length === 0
        ? ("NO_PENDING_JOBS" as const)
        : null,
  };
}
"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { createKnowledgeIndexJobIfIdle } from "@/features/knowledge/repositories/knowledge-index-job.repository";
import { getKnowledgeSourceForEmployee } from "@/features/knowledge/repositories/knowledge.repository";
import { reindexKnowledgeSourceSchema } from "@/features/knowledge/schemas/reindex-knowledge-source-schema";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type ReindexKnowledgeSourceState = {
  success: boolean;
  message: string | null;
};

export async function reindexKnowledgeSourceAction(
  _previousState: ReindexKnowledgeSourceState,
  formData: FormData,
): Promise<ReindexKnowledgeSourceState> {
  const parsed = reindexKnowledgeSourceSchema.safeParse({
    sourceId: formData.get("sourceId"),
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid request.",
    };
  }

  const { sourceId, employeeId, locale } = parsed.data;

  const workspace = await getCurrentWorkspace();

  const hasAccess = await aiEmployeeBelongsToWorkspace({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!hasAccess) {
    return {
      success: false,
      message: "AI Employee was not found.",
    };
  }

  const source = await getKnowledgeSourceForEmployee({
    sourceId,
    employeeId,
  });

  if (!source) {
    return {
      success: false,
      message: "Knowledge source was not found.",
    };
  }

  const result = await createKnowledgeIndexJobIfIdle(
    source.id,
  );

  revalidatePath(
    `/${locale}/dashboard/employees/${employeeId}/knowledge`,
  );

  revalidatePath(
    `/${locale}/dashboard/employees/${employeeId}/knowledge/${sourceId}`,
  );

  if (!result.created) {
    return {
      success: false,
      message: "This knowledge source is already being indexed.",
    };
  }

  return {
    success: true,
    message: "Knowledge source was queued for re-indexing.",
  };
}
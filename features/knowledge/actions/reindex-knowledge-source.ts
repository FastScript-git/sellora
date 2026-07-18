"use server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { reindexKnowledgeSourceSchema } from "@/features/knowledge/schemas/reindex-knowledge-source-schema";

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

  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return {
      success: false,
      message: "Workspace not found.",
    };
  }

  return {
    success: true,
    message: "Workspace validated.",
  };
}
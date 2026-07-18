"use server";

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

  return {
    success: true,
    message: "Validation passed.",
  };
}
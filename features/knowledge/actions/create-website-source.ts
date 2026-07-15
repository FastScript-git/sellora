"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { updateKnowledgeSourceStatus } from "@/features/knowledge/repositories/knowledge.repository";
import { createWebsiteSourceSchema } from "@/features/knowledge/schemas/create-website-source-schema";
import { indexWebsiteSource } from "@/features/knowledge/services/index-website-source";
import { createKnowledge } from "@/features/knowledge/services/knowledge.service";
import {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type CreateWebsiteSourceState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<Record<"title" | "sourceUrl", string>>;
};

export async function createWebsiteSourceAction(
  _previousState: CreateWebsiteSourceState,
  formData: FormData,
): Promise<CreateWebsiteSourceState> {
  const parsed = createWebsiteSourceSchema.safeParse({
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    sourceUrl: formData.get("sourceUrl"),
  });

  if (!parsed.success) {
    const fieldErrors: CreateWebsiteSourceState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (field === "title" || field === "sourceUrl") {
        fieldErrors[field] ??= issue.message;
      }
    }

    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const knowledgePath =
    `/${parsed.data.locale}/dashboard/employees/` +
    `${parsed.data.employeeId}/knowledge`;

  try {
    const workspace = await getCurrentWorkspace();

    const hasAccess = await aiEmployeeBelongsToWorkspace({
      employeeId: parsed.data.employeeId,
      workspaceId: workspace.id,
    });

    if (!hasAccess) {
      return {
        success: false,
        message: "AI Employee was not found in this workspace.",
        fieldErrors: {},
      };
    }

    const source = await createKnowledge({
      employeeId: parsed.data.employeeId,
      type: KnowledgeSourceType.WEBSITE,
      title: parsed.data.title,
      sourceUrl: parsed.data.sourceUrl,
    });

    await updateKnowledgeSourceStatus({
      sourceId: source.id,
      status: KnowledgeSourceStatus.INDEXING,
    });

    revalidatePath(knowledgePath);

    try {
      await indexWebsiteSource({
        knowledgeSourceId: source.id,
        url: parsed.data.sourceUrl,
      });

      await updateKnowledgeSourceStatus({
        sourceId: source.id,
        status: KnowledgeSourceStatus.INDEXED,
      });

      revalidatePath(knowledgePath);

      return {
        success: true,
        message: "Website added and indexed successfully.",
        fieldErrors: {},
      };
    } catch (indexingError) {
      console.error(
        "Failed to index website knowledge source:",
        indexingError,
      );

      await updateKnowledgeSourceStatus({
        sourceId: source.id,
        status: KnowledgeSourceStatus.FAILED,
      });

      revalidatePath(knowledgePath);

      return {
        success: false,
        message:
          "Website was added, but indexing failed. You can retry it later.",
        fieldErrors: {},
      };
    }
  } catch (error) {
    console.error(
      "Failed to create website knowledge source:",
      error,
    );

    return {
      success: false,
      message: "Unable to create knowledge source.",
      fieldErrors: {},
    };
  }
}
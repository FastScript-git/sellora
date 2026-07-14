"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { createWebsiteSourceSchema } from "@/features/knowledge/schemas/create-website-source-schema";
import { createKnowledge } from "@/features/knowledge/services/knowledge.service";
import { KnowledgeSourceType } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type CreateWebsiteSourceState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<Record<"title" | "sourceUrl", string>>;
};

export const initialCreateWebsiteSourceState: CreateWebsiteSourceState = {
  success: false,
  message: null,
  fieldErrors: {},
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

    await createKnowledge({
      employeeId: parsed.data.employeeId,
      type: KnowledgeSourceType.WEBSITE,
      title: parsed.data.title,
      sourceUrl: parsed.data.sourceUrl,
    });

    revalidatePath(
      `/${parsed.data.locale}/dashboard/employees/${parsed.data.employeeId}/knowledge`,
    );

    return {
      success: true,
      message: "Website added successfully.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error("Failed to create website knowledge source:", error);

    return {
      success: false,
      message: "Unable to create knowledge source.",
      fieldErrors: {},
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { createKnowledgeIndexJob } from "@/features/knowledge/repositories/knowledge-index-job.repository";
import { createNoteSourceSchema } from "@/features/knowledge/schemas/create-note-source-schema";
import { createKnowledge } from "@/features/knowledge/services/knowledge.service";
import { KnowledgeSourceType } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type CreateNoteSourceState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<Record<"title" | "content", string>>;
};

export async function createNoteSourceAction(
  _previousState: CreateNoteSourceState,
  formData: FormData,
): Promise<CreateNoteSourceState> {
  const parsed = createNoteSourceSchema.safeParse({
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    const fieldErrors: CreateNoteSourceState["fieldErrors"] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (field === "title" || field === "content") {
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
      type: KnowledgeSourceType.NOTE,
      title: parsed.data.title,
      content: parsed.data.content,
    });

    try {
      await createKnowledgeIndexJob(source.id);
    } catch (queueError) {
      console.error(
        "Failed to queue note knowledge source:",
        queueError,
      );

      return {
        success: false,
        message:
          "Note was created, but it could not be added to the indexing queue.",
        fieldErrors: {},
      };
    }

    revalidatePath(knowledgePath);

    return {
      success: true,
      message:
        "Note added successfully. Indexing will start shortly.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "Failed to create note knowledge source:",
      error,
    );

    return {
      success: false,
      message: "Unable to create note knowledge source.",
      fieldErrors: {},
    };
  }
}
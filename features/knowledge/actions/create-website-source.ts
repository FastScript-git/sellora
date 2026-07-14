"use server";

import { revalidatePath } from "next/cache";
import { KnowledgeSourceType } from "@/lib/generated/prisma/client";

import { createWebsiteSourceSchema } from "@/features/knowledge/schemas/create-website-source-schema";
import { createKnowledge } from "@/features/knowledge/services/knowledge.service";

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
        fieldErrors[field] = issue.message;
      }
    }

    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  try {
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
    console.error(error);

    return {
      success: false,
      message: "Unable to create knowledge source.",
      fieldErrors: {},
    };
  }
}
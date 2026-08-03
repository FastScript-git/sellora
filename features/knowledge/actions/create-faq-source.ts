"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { createKnowledgeIndexJob } from "@/features/knowledge/repositories/knowledge-index-job.repository";
import { createFaqSourceSchema } from "@/features/knowledge/schemas/create-faq-source-schema";
import { createKnowledge } from "@/features/knowledge/services/knowledge.service";
import { KnowledgeSourceType } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export type CreateFaqSourceState = {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<
    Record<"title" | "items", string>
  >;
};

function buildFaqContent(
  items: Array<{
    question: string;
    answer: string;
  }>,
) {
  return items
    .map(
      (item, index) =>
        [
          `FAQ item ${index + 1}`,
          "",
          `Question: ${item.question}`,
          "",
          `Answer: ${item.answer}`,
        ].join("\n"),
    )
    .join("\n\n---\n\n");
}

export async function createFaqSourceAction(
  _previousState: CreateFaqSourceState,
  formData: FormData,
): Promise<CreateFaqSourceState> {
  let parsedItems: unknown;

  try {
    parsedItems = JSON.parse(
      String(formData.get("items") ?? "[]"),
    );
  } catch {
    return {
      success: false,
      message:
        "FAQ questions could not be processed.",
      fieldErrors: {
        items:
          "FAQ questions contain invalid data.",
      },
    };
  }

  const parsed = createFaqSourceSchema.safeParse({
    employeeId: formData.get("employeeId"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    items: parsedItems,
  });

  if (!parsed.success) {
    const fieldErrors: CreateFaqSourceState["fieldErrors"] =
      {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        field === "title" ||
        field === "items"
      ) {
        fieldErrors[field] ??= issue.message;
      }
    }

    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const {
    employeeId,
    locale,
    title,
    items,
  } = parsed.data;

  const knowledgePath =
    `/${locale}/dashboard/employees/` +
    `${employeeId}/knowledge`;

  try {
    const workspace =
      await getCurrentWorkspace();

    const hasAccess =
      await aiEmployeeBelongsToWorkspace({
        employeeId,
        workspaceId: workspace.id,
      });

    if (!hasAccess) {
      return {
        success: false,
        message:
          "AI Employee was not found in this workspace.",
        fieldErrors: {},
      };
    }

    const content = buildFaqContent(items);

    const source = await createKnowledge({
      employeeId,
      type: KnowledgeSourceType.FAQ,
      title,
      content,
    });

    try {
      await createKnowledgeIndexJob(source.id);
    } catch (queueError) {
      console.error(
        "Failed to queue FAQ knowledge source:",
        queueError,
      );

      return {
        success: false,
        message:
          "FAQ was created, but it could not be added to the indexing queue.",
        fieldErrors: {},
      };
    }

    revalidatePath(knowledgePath);

    return {
      success: true,
      message:
        locale === "uk"
          ? "FAQ додано. Індексація розпочнеться найближчим часом."
          : "FAQ added successfully. Indexing will start shortly.",
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "Failed to create FAQ knowledge source:",
      error,
    );

    return {
      success: false,
      message:
        locale === "uk"
          ? "Не вдалося створити FAQ."
          : "Unable to create FAQ knowledge source.",
      fieldErrors: {},
    };
  }
}

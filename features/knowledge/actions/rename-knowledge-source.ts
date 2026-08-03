"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import {
  getKnowledgeSourceForEmployee,
  renameKnowledgeSource,
} from "@/features/knowledge/repositories/knowledge.repository";
import {
  renameKnowledgeSourceSchema,
  type RenameKnowledgeSourceInput,
} from "@/features/knowledge/schemas/manage-knowledge-source-schema";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type RenameKnowledgeSourceResult =
  | {
      success: true;
      title: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function renameKnowledgeSourceAction(
  input: RenameKnowledgeSourceInput,
): Promise<RenameKnowledgeSourceResult> {
  const parsedInput =
    renameKnowledgeSourceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid knowledge source data.",
      fieldErrors:
        parsedInput.error.flatten().fieldErrors,
    };
  }

  const {
    sourceId,
    employeeId,
    locale,
    title,
  } = parsedInput.data;

  try {
    const workspace = await getCurrentWorkspace();

    const hasAccess =
      await aiEmployeeBelongsToWorkspace({
        employeeId,
        workspaceId: workspace.id,
      });

    if (!hasAccess) {
      return {
        success: false,
        error: "AI Employee was not found.",
      };
    }

    const source =
      await getKnowledgeSourceForEmployee({
        sourceId,
        employeeId,
      });

    if (!source) {
      return {
        success: false,
        error: "Knowledge source was not found.",
      };
    }

    const result = await renameKnowledgeSource({
      sourceId,
      employeeId,
      title,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Knowledge source was not renamed.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}/knowledge`,
    );

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}/knowledge/${sourceId}`,
    );

    return {
      success: true,
      title,
    };
  } catch (error) {
    console.error(
      "Failed to rename knowledge source:",
      error,
    );

    return {
      success: false,
      error: "Failed to rename knowledge source.",
    };
  }
}

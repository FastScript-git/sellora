"use server";

import { revalidatePath } from "next/cache";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import {
  deleteKnowledgeSourceForEmployee,
  getKnowledgeSourceForEmployee,
} from "@/features/knowledge/repositories/knowledge.repository";
import {
  deleteKnowledgeSourceSchema,
  type DeleteKnowledgeSourceInput,
} from "@/features/knowledge/schemas/manage-knowledge-source-schema";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type DeleteKnowledgeSourceResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function deleteKnowledgeSourceAction(
  input: DeleteKnowledgeSourceInput,
): Promise<DeleteKnowledgeSourceResult> {
  const parsedInput =
    deleteKnowledgeSourceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Invalid knowledge source data.",
    };
  }

  const {
    sourceId,
    employeeId,
    locale,
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

    const result =
      await deleteKnowledgeSourceForEmployee({
        sourceId,
        employeeId,
      });

    if (result.count === 0) {
      return {
        success: false,
        error: "Knowledge source was not deleted.",
      };
    }

    revalidatePath(
      `/${locale}/dashboard/employees/${employeeId}/knowledge`,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to delete knowledge source:",
      error,
    );

    return {
      success: false,
      error: "Failed to delete knowledge source.",
    };
  }
}

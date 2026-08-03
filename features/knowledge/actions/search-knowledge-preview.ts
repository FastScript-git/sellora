"use server";

import { z } from "zod";

import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import {
  searchKnowledge,
  type KnowledgeSearchResult,
} from "@/features/knowledge/services/search-knowledge";
import { getCurrentWorkspace } from "@/lib/current-workspace";

const searchKnowledgePreviewSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required."),

  query: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(500, "Search query is too long."),

  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5),
});

type SearchKnowledgePreviewInput = z.input<
  typeof searchKnowledgePreviewSchema
>;

export type SearchKnowledgePreviewResult =
  | {
      success: true;
      query: string;
      results: KnowledgeSearchResult[];
      durationMs: number;
    }
  | {
      success: false;
      error: string;
    };

export async function searchKnowledgePreviewAction(
  input: SearchKnowledgePreviewInput,
): Promise<SearchKnowledgePreviewResult> {
  const parsedInput =
    searchKnowledgePreviewSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error:
        parsedInput.error.issues[0]?.message ??
        "Invalid search query.",
    };
  }

  const {
    employeeId,
    query,
    limit,
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

    const startedAt = performance.now();

    const results = await searchKnowledge({
      employeeId,
      query,
      limit,
    });

    return {
      success: true,
      query,
      results,
      durationMs: Math.round(
        performance.now() - startedAt,
      ),
    };
  } catch (error) {
    console.error(
      "Failed to search knowledge preview:",
      error,
    );

    return {
      success: false,
      error:
        "Knowledge search could not be completed.",
    };
  }
}

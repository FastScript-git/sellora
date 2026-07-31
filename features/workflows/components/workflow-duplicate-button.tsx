"use client";

import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type WorkflowDuplicateButtonProps = {
  workflowId: string;
  locale: string;
};

type DuplicateWorkflowResponse = {
  success: boolean;
  workflow?: {
    id: string;
  };
  error?: string;
};

export function WorkflowDuplicateButton({
  workflowId,
  locale,
}: WorkflowDuplicateButtonProps) {
  const router = useRouter();

  const [isDuplicating, setIsDuplicating] =
    useState(false);

  const isUkrainian = locale === "uk";

  async function duplicateWorkflow(): Promise<void> {
    setIsDuplicating(true);

    try {
      const response = await fetch(
        `/api/workflows/${workflowId}/duplicate`,
        {
          method: "POST",
        },
      );

      const data =
        (await response.json()) as DuplicateWorkflowResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.workflow?.id
      ) {
        throw new Error(
          data.error ??
            (isUkrainian
              ? "Не вдалося створити копію workflow."
              : "Failed to duplicate workflow."),
        );
      }

      router.push(
        `/${locale}/dashboard/workflows/${data.workflow.id}`,
      );

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : isUkrainian
            ? "Не вдалося створити копію workflow."
            : "Failed to duplicate workflow.",
      );
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isDuplicating}
      onClick={duplicateWorkflow}
    >
      {isDuplicating ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Copy />
      )}

      {isDuplicating
        ? isUkrainian
          ? "Копіювання..."
          : "Duplicating..."
        : isUkrainian
          ? "Дублювати"
          : "Duplicate"}
    </Button>
  );
}

"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type WorkflowRestoreButtonProps = {
  workflowId: string;
  locale: string;
};

type WorkflowResponse = {
  success: boolean;
  error?: string;
};

export function WorkflowRestoreButton({
  workflowId,
  locale,
}: WorkflowRestoreButtonProps) {
  const router = useRouter();

  const [isRestoring, setIsRestoring] =
    useState(false);

  const isUkrainian = locale === "uk";

  async function restoreWorkflow(): Promise<void> {
    setIsRestoring(true);

    try {
      const response = await fetch(
        `/api/workflows/${workflowId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DRAFT",
          }),
        },
      );

      const data =
        (await response.json()) as WorkflowResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ??
            (isUkrainian
              ? "Не вдалося відновити workflow."
              : "Failed to restore workflow."),
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : isUkrainian
            ? "Не вдалося відновити workflow."
            : "Failed to restore workflow.",
      );
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <Button
      type="button"
      disabled={isRestoring}
      onClick={restoreWorkflow}
    >
      {isRestoring ? (
        <Loader2 className="animate-spin" />
      ) : (
        <RotateCcw />
      )}

      {isRestoring
        ? isUkrainian
          ? "Відновлення..."
          : "Restoring..."
        : isUkrainian
          ? "Відновити"
          : "Restore"}
    </Button>
  );
}

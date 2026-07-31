"use client";

import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type WorkflowArchiveButtonProps = {
  workflowId: string;
  locale: string;
};

type WorkflowResponse = {
  success: boolean;
  error?: string;
};

export function WorkflowArchiveButton({
  workflowId,
  locale,
}: WorkflowArchiveButtonProps) {
  const router = useRouter();

  const [isArchiving, setIsArchiving] =
    useState(false);

  const isUkrainian = locale === "uk";

  async function archiveWorkflow() {
    const confirmed = window.confirm(
      isUkrainian
        ? "Перемістити workflow в архів?"
        : "Archive this workflow?",
    );

    if (!confirmed) {
      return;
    }

    setIsArchiving(true);

    try {
      const response = await fetch(
        `/api/workflows/${workflowId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "ARCHIVED",
          }),
        },
      );

      const data =
        (await response.json()) as WorkflowResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ??
            (isUkrainian
              ? "Не вдалося архівувати workflow."
              : "Failed to archive workflow."),
        );
      }

      router.push(
        `/${locale}/dashboard/workflows`,
      );

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : isUkrainian
            ? "Не вдалося архівувати workflow."
            : "Failed to archive workflow.",
      );
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isArchiving}
      onClick={archiveWorkflow}
    >
      {isArchiving ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Archive />
      )}

      {isArchiving
        ? isUkrainian
          ? "Архівація..."
          : "Archiving..."
        : isUkrainian
          ? "Архівувати"
          : "Archive"}
    </Button>
  );
}

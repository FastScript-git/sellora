"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

type WorkflowRunButtonProps = {
  workflowId: string;
};

type WorkflowRunResponse = {
  success: boolean;
  error?: string;
};

export function WorkflowRunButton({
  workflowId,
}: WorkflowRunButtonProps) {
  const router = useRouter();

  const [isRunning, setIsRunning] = useState(false);

  async function runWorkflow() {
    setIsRunning(true);

    try {
      const response = await fetch(
        `/api/workflows/${workflowId}/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: "{}",
        },
      );

      const data =
        (await response.json()) as WorkflowRunResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ?? "Failed to run workflow.",
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to run workflow.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Button
      onClick={runWorkflow}
      disabled={isRunning}
    >
      {isRunning ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Running...
        </>
      ) : (
        <>
          <Play className="mr-2 size-4" />
          Run now
        </>
      )}
    </Button>
  );
}
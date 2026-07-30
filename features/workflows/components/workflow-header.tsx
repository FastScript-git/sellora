"use client";

import {
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkflowStatus = "DRAFT" | "ACTIVE";

type WorkflowHeaderProps = {
  workflowsPath: string;
  canSubmit: boolean;
  isSaving: boolean;
  submitStatus: WorkflowStatus | null;
  onSubmit: (status: WorkflowStatus) => void;
};

export function WorkflowHeader({
  workflowsPath,
  canSubmit,
  isSaving,
  submitStatus,
  onSubmit,
}: WorkflowHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b pb-6">
      <div>
        <a
          href={workflowsPath}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "-ml-2",
          )}
        >
          <ArrowLeft />
          Back to workflows
        </a>
      </div>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
              <Workflow className="size-4" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Create workflow
            </h1>
          </div>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Configure the trigger and optional conditions that control
            when this workflow should run.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canSubmit}
            onClick={() => onSubmit("DRAFT")}
          >
            {isSaving && submitStatus === "DRAFT" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save />
            )}
            Save draft
          </Button>

          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit("ACTIVE")}
          >
            {isSaving && submitStatus === "ACTIVE" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            Create active workflow
          </Button>
        </div>
      </div>
    </header>
  );
}

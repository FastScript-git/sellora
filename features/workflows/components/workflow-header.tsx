"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WorkflowSubmitStatus = "DRAFT" | "ACTIVE";

type WorkflowHeaderProps = {
  mode?: "create" | "edit";
  backPath: string;
  canSubmit: boolean;
  isSaving: boolean;
  submitStatus: WorkflowSubmitStatus | null;
  onSubmit: (status: WorkflowSubmitStatus) => void;
};

export function WorkflowHeader({
  mode = "create",
  backPath,
  canSubmit,
  isSaving,
  submitStatus,
  onSubmit,
}: WorkflowHeaderProps) {
  const isEditMode = mode === "edit";

  const title = isEditMode
    ? "Edit workflow"
    : "Create workflow";

  const description = isEditMode
    ? "Update the workflow details, trigger, conditions and actions."
    : "Configure the trigger, conditions and actions that control how this workflow runs.";

  const draftButtonLabel = isEditMode
    ? "Save as draft"
    : "Save draft";

  const activeButtonLabel = isEditMode
    ? "Save and activate"
    : "Create active workflow";

  return (
    <header className="flex flex-col gap-4 border-b pb-6">
      <div>
        <Link
          href={backPath}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "-ml-2",
          )}
        >
          <ArrowLeft />
          {isEditMode
            ? "Back to workflow"
            : "Back to workflows"}
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
              <Workflow className="size-4" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>

          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
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

            {draftButtonLabel}
          </Button>

          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit("ACTIVE")}
          >
            {isSaving && submitStatus === "ACTIVE" ? (
              <Loader2 className="animate-spin" />
            ) : isEditMode ? (
              <Check />
            ) : (
              <Sparkles />
            )}

            {activeButtonLabel}
          </Button>
        </div>
      </div>
    </header>
  );
}

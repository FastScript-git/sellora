"use client";

import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WorkflowSubmitStatus =
  | "DRAFT"
  | "ACTIVE";

type WorkflowHeaderProps = {
  mode?: "create" | "edit";
  backPath: string;
  canSubmit: boolean;
  isSaving: boolean;
  submitStatus:
    | WorkflowSubmitStatus
    | null;
  onSubmit: (
    status: WorkflowSubmitStatus,
  ) => void;
};

export function WorkflowHeader({
  mode = "create",
  backPath,
  canSubmit,
  isSaving,
  submitStatus,
  onSubmit,
}: WorkflowHeaderProps) {
  const isEditMode =
    mode === "edit";

  const title = isEditMode
    ? "Edit workflow"
    : "Create workflow";

  const description = isEditMode
    ? "Update the workflow details, trigger, conditions and actions."
    : "Configure the trigger, conditions and actions that control how this workflow runs.";

  const backLabel = isEditMode
    ? "Back to workflow"
    : "Back to workflows";

  const draftButtonLabel =
    isEditMode
      ? "Save as draft"
      : "Save draft";

  const activeButtonLabel =
    isEditMode
      ? "Save and activate"
      : "Create active workflow";

  const isDraftSaving =
    isSaving &&
    submitStatus === "DRAFT";

  const isActiveSaving =
    isSaving &&
    submitStatus === "ACTIVE";

  return (
    <header className="min-w-0 space-y-3 border-b pb-5">
      <Link
        href={backPath}
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "-ml-2 w-fit gap-2",
        )}
      >
        <ArrowLeft className="size-4" />

        {backLabel}
      </Link>

      <PageHeader
        compact
        icon={Workflow}
        eyebrow={
          isEditMode
            ? "Workflow editor"
            : "Workflow builder"
        }
        title={title}
        description={description}
        actionsClassName="w-full lg:w-auto"
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={
                !canSubmit || isSaving
              }
              onClick={() =>
                onSubmit("DRAFT")
              }
              className="w-full sm:w-auto"
            >
              {isDraftSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {draftButtonLabel}
            </Button>

            <Button
              type="button"
              disabled={
                !canSubmit || isSaving
              }
              onClick={() =>
                onSubmit("ACTIVE")
              }
              className="w-full sm:w-auto"
            >
              {isActiveSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEditMode ? (
                <Check className="size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}

              {activeButtonLabel}
            </Button>
          </>
        }
      />
    </header>
  );
}

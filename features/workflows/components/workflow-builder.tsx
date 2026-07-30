"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkflowConditionList,
  type WorkflowConditionItem,
} from "@/features/workflows/components/workflow-condition-list";
import { cn } from "@/lib/utils";

type WorkflowStatus = "DRAFT" | "ACTIVE";

type WorkflowTriggerType =
  | "CONTACT_CREATED"
  | "MESSAGE_RECEIVED"
  | "LEAD_QUALIFIED"
  | "TASK_COMPLETED"
  | "PIPELINE_STAGE_CHANGED";

type CreateWorkflowResponse = {
  success: boolean;
  workflow?: {
    id: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type TriggerOption = {
  value: WorkflowTriggerType;
  label: string;
  description: string;
};

const triggerOptions: TriggerOption[] = [
  {
    value: "CONTACT_CREATED",
    label: "Contact created",
    description:
      "Run the workflow when a new contact is created in the workspace.",
  },
  {
    value: "MESSAGE_RECEIVED",
    label: "Message received",
    description:
      "Run the workflow when Sellora receives a new customer message.",
  },
  {
    value: "LEAD_QUALIFIED",
    label: "Lead qualified",
    description:
      "Run the workflow when a contact becomes a qualified lead.",
  },
  {
    value: "TASK_COMPLETED",
    label: "Task completed",
    description:
      "Run the workflow after a workspace task is completed.",
  },
  {
    value: "PIPELINE_STAGE_CHANGED",
    label: "Pipeline stage changed",
    description:
      "Run the workflow when a contact moves to another pipeline stage.",
  },
];

function getTriggerOption(
  value: WorkflowTriggerType,
): TriggerOption {
  return (
    triggerOptions.find((option) => option.value === value) ??
    triggerOptions[0]
  );
}

function getApiErrorMessage(
  data: CreateWorkflowResponse,
): string {
  if (data.error) {
    return data.error;
  }

  if (data.fieldErrors) {
    const firstError = Object.values(data.fieldErrors)
      .flat()
      .find(
        (message): message is string =>
          typeof message === "string",
      );

    if (firstError) {
      return firstError;
    }
  }

  return "Failed to create workflow.";
}

function parseConditionValue(
  condition: WorkflowConditionItem,
): string | number | boolean | null {
  if (
    condition.operator === "EXISTS" ||
    condition.operator === "NOT_EXISTS"
  ) {
    return null;
  }

  const trimmedValue = condition.value.trim();

  if (
    condition.field === "contact.leadScore" &&
    trimmedValue !== ""
  ) {
    const numericValue = Number(trimmedValue);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  if (trimmedValue === "true") {
    return true;
  }

  if (trimmedValue === "false") {
    return false;
  }

  return trimmedValue;
}

export function WorkflowBuilder() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const locale =
    typeof params.locale === "string" ? params.locale : "en";

  const workflowsPath = `/${locale}/dashboard/workflows`;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] =
    useState<WorkflowTriggerType>("CONTACT_CREATED");
  const [conditions, setConditions] = useState<
    WorkflowConditionItem[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [submitStatus, setSubmitStatus] =
    useState<WorkflowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTrigger = getTriggerOption(triggerType);

  const isNameValid = name.trim().length >= 2;

  const areConditionsValid = conditions.every(
    (condition) =>
      condition.field.trim().length > 0 &&
      (condition.operator === "EXISTS" ||
        condition.operator === "NOT_EXISTS" ||
        condition.value.trim().length > 0),
  );

  const canSubmit =
    isNameValid && areConditionsValid && !isSaving;

  async function createWorkflow(
    status: WorkflowStatus,
  ): Promise<void> {
    if (!isNameValid) {
      setError(
        "Workflow name must contain at least 2 characters.",
      );
      return;
    }

    if (!areConditionsValid) {
      setError(
        "Complete all condition values before saving the workflow.",
      );
      return;
    }

    setIsSaving(true);
    setSubmitStatus(status);
    setError(null);

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          trigger: {
            type: triggerType,
          },
          conditions: conditions.map((condition, index) => ({
            field: condition.field,
            operator: condition.operator,
            value: parseConditionValue(condition),
            position: index,
          })),
        }),
      });

      const data =
        (await response.json()) as CreateWorkflowResponse;

      if (!response.ok || !data.success) {
        throw new Error(getApiErrorMessage(data));
      }

      router.push(workflowsPath);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to create workflow.",
      );
    } finally {
      setIsSaving(false);
      setSubmitStatus(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
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
              Configure the trigger and optional conditions that
              control when this workflow should run.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!canSubmit}
              onClick={() => createWorkflow("DRAFT")}
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
              onClick={() => createWorkflow("ACTIVE")}
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

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow details</CardTitle>
              <CardDescription>
                Give the workflow a clear name and optional
                description.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">
                  Workflow name
                </Label>

                <Input
                  id="workflow-name"
                  value={name}
                  maxLength={120}
                  placeholder="Example: Qualify new leads"
                  aria-invalid={
                    name.length > 0 && !isNameValid
                  }
                  onChange={(event) => {
                    setName(event.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />

                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <span>
                    Use a name that explains the workflow goal.
                  </span>
                  <span>{name.length}/120</span>
                </div>

                {name.length > 0 && !isNameValid ? (
                  <p className="text-xs text-destructive">
                    Enter at least 2 characters.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-description">
                  Description
                </Label>

                <Textarea
                  id="workflow-description"
                  value={description}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe what this workflow should accomplish..."
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

                <div className="flex justify-end text-xs text-muted-foreground">
                  {description.length}/500
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <Sparkles className="size-4" />
                </div>

                <div className="space-y-1">
                  <CardTitle>Trigger</CardTitle>
                  <CardDescription>
                    Choose the event that starts the workflow.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trigger event</Label>

                <Select
                  value={triggerType}
                  onValueChange={(value) => {
                    if (value) {
                      setTriggerType(
                        value as WorkflowTriggerType,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {triggerOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {selectedTrigger.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTrigger.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <WorkflowConditionList
            conditions={conditions}
            onChange={(nextConditions) => {
              setConditions(nextConditions);

              if (error) {
                setError(null);
              }
            }}
          />
        </main>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Workflow summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="font-medium">
                  {name.trim() || "Untitled workflow"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Trigger
                </p>
                <p>{selectedTrigger.label}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Conditions
                </p>
                <p>
                  {conditions.length === 0
                    ? "No conditions"
                    : `${conditions.length} condition${
                        conditions.length === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </p>
                <p>Not configured yet</p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium">
              Builder progress
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Workflow details, trigger and conditions are now
              connected. Actions will be added in the next step.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

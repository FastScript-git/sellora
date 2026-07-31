"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowActionList } from "@/features/workflows/components/workflow-action-list";
import {
  isWorkflowActionValid,
  type WorkflowActionItem,
  type WorkflowEmployeeOption,
} from "@/features/workflows/components/workflow-action-card";
import {
  WorkflowConditionList,
  type WorkflowConditionItem,
} from "@/features/workflows/components/workflow-condition-list";
import { WorkflowHeader } from "@/features/workflows/components/workflow-header";
import { WorkflowSummary } from "@/features/workflows/components/workflow-summary";
import {
  WorkflowTriggerCard,
  type WorkflowTriggerType,
} from "@/features/workflows/components/workflow-trigger-card";

type WorkflowStatus = "DRAFT" | "ACTIVE";

type CreateWorkflowResponse = {
  success: boolean;
  workflow?: {
    id: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type WorkflowActionPayloadConfig = Record<
  string,
  string | number | null
>;

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

function parseOptionalNonNegativeNumber(
  value: string | undefined,
): number | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const numericValue = Number(trimmedValue);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0
  ) {
    return undefined;
  }

  return numericValue;
}

function buildActionConfig(
  action: WorkflowActionItem,
): WorkflowActionPayloadConfig {
  switch (action.type) {
    case "CREATE_TASK": {
      const dueInDays = parseOptionalNonNegativeNumber(
        action.config.dueInDays,
      );

      const reminderInHours =
        parseOptionalNonNegativeNumber(
          action.config.reminderInHours,
        );

      return {
        title:
          action.config.title?.trim() || "Workflow task",
        description:
          action.config.description?.trim() || null,
        priority: action.config.priority ?? "MEDIUM",
        ...(dueInDays !== undefined
          ? {
              dueInDays,
            }
          : {}),
        ...(reminderInHours !== undefined
          ? {
              reminderInHours,
            }
          : {}),
      };
    }

    case "ASSIGN_EMPLOYEE":
      return {
        employeeId:
          action.config.employeeId?.trim() ?? "",
      };

    case "UPDATE_CONTACT_STATUS":
      return {
        status: action.config.status ?? "LEAD",
      };

    case "ADD_TAG":
      return {
        tag: action.config.tag?.trim() ?? "",
      };
  }
}

type WorkflowBuilderProps = {
  employees: WorkflowEmployeeOption[];
};

export function WorkflowBuilder({
  employees,
}: WorkflowBuilderProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  const workflowsPath = `/${locale}/dashboard/workflows`;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [triggerType, setTriggerType] =
    useState<WorkflowTriggerType>("CONTACT_CREATED");

  const [conditions, setConditions] = useState<
    WorkflowConditionItem[]
  >([]);

  const [actions, setActions] = useState<
    WorkflowActionItem[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);

  const [submitStatus, setSubmitStatus] =
    useState<WorkflowStatus | null>(null);

  const [error, setError] = useState<string | null>(null);

  const isNameValid = name.trim().length >= 2;

  const areConditionsValid = conditions.every(
    (condition) =>
      condition.field.trim().length > 0 &&
      (condition.operator === "EXISTS" ||
        condition.operator === "NOT_EXISTS" ||
        condition.value.trim().length > 0),
  );

  const areActionNumbersValid = actions.every(
    (action) => {
      if (action.type !== "CREATE_TASK") {
        return true;
      }

      const dueInDays = action.config.dueInDays?.trim();
      const reminderInHours =
        action.config.reminderInHours?.trim();

      const isDueInDaysValid =
        !dueInDays ||
        (Number.isFinite(Number(dueInDays)) &&
          Number(dueInDays) >= 0);

      const isReminderInHoursValid =
        !reminderInHours ||
        (Number.isFinite(Number(reminderInHours)) &&
          Number(reminderInHours) >= 0);

      return (
        isDueInDaysValid && isReminderInHoursValid
      );
    },
  );

  const areActionsValid =
    actions.length > 0 &&
    actions.every(isWorkflowActionValid) &&
    areActionNumbersValid;

  const canSubmit =
    isNameValid &&
    areConditionsValid &&
    areActionsValid &&
    !isSaving;

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

    if (actions.length === 0) {
      setError(
        "Add at least one action before saving the workflow.",
      );
      return;
    }

    if (!actions.every(isWorkflowActionValid)) {
      setError(
        "Complete all required action settings before saving the workflow.",
      );
      return;
    }

    if (!areActionNumbersValid) {
      setError(
        "Due days and reminder hours must be valid non-negative numbers.",
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
          conditions: conditions.map(
            (condition, index) => ({
              field: condition.field,
              operator: condition.operator,
              value: parseConditionValue(condition),
              position: index,
            }),
          ),
          actions: actions.map((action, index) => ({
            type: action.type,
            config: buildActionConfig(action),
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
      <WorkflowHeader
        workflowsPath={workflowsPath}
        canSubmit={canSubmit}
        isSaving={isSaving}
        submitStatus={submitStatus}
        onSubmit={createWorkflow}
      />

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

          <WorkflowTriggerCard
            value={triggerType}
            onChange={setTriggerType}
          />

          <WorkflowConditionList
            conditions={conditions}
            onChange={(nextConditions) => {
              setConditions(nextConditions);

              if (error) {
                setError(null);
              }
            }}
          />

          <WorkflowActionList
            actions={actions}
            employees={employees}
            onChange={(nextActions) => {
              setActions(nextActions);

              if (error) {
                setError(null);
              }
            }}
          />
        </main>

        <WorkflowSummary
          name={name}
          triggerType={triggerType}
          conditionsCount={conditions.length}
          actionsCount={actions.length}
        />
      </div>
    </div>
  );
}

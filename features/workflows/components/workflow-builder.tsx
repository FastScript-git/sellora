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

type WorkflowBuilderMode = "create" | "edit";
type WorkflowSubmitStatus = "DRAFT" | "ACTIVE";

export type WorkflowBuilderInitialData = {
  name: string;
  description: string;
  status: WorkflowSubmitStatus;
  triggerType: WorkflowTriggerType;
  conditions: WorkflowConditionItem[];
  actions: WorkflowActionItem[];
};

type WorkflowBuilderProps = {
  employees: WorkflowEmployeeOption[];
  mode?: WorkflowBuilderMode;
  workflowId?: string;
  initialWorkflow?: WorkflowBuilderInitialData;
};

type WorkflowMutationResponse = {
  success: boolean;
  workflow?: {
    id: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

type WorkflowActionPayloadConfig = Record<
  string,
  string | number | null
>;

const emptyInitialWorkflow: WorkflowBuilderInitialData = {
  name: "",
  description: "",
  status: "DRAFT",
  triggerType: "CONTACT_CREATED",
  conditions: [],
  actions: [],
};

function cloneConditions(
  conditions: WorkflowConditionItem[],
): WorkflowConditionItem[] {
  return conditions.map((condition) => ({
    ...condition,
  }));
}

function cloneActions(
  actions: WorkflowActionItem[],
): WorkflowActionItem[] {
  return actions.map((action) => ({
    ...action,
    config: {
      ...action.config,
    },
  }));
}

function getApiErrorMessage(
  data: WorkflowMutationResponse,
  fallbackMessage: string,
): string {
  if (data.error) {
    return data.error;
  }

  if (data.fieldErrors) {
    const firstFieldError = Object.values(data.fieldErrors)
      .flat()
      .find(
        (message): message is string =>
          typeof message === "string",
      );

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  const firstFormError = data.formErrors?.find(
    (message): message is string =>
      typeof message === "string",
  );

  return firstFormError ?? fallbackMessage;
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

export function WorkflowBuilder({
  employees,
  mode = "create",
  workflowId,
  initialWorkflow,
}: WorkflowBuilderProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  const workflowsPath = `/${locale}/dashboard/workflows`;

  const source =
    mode === "edit" && initialWorkflow
      ? initialWorkflow
      : emptyInitialWorkflow;

  const [name, setName] = useState(source.name);

  const [description, setDescription] = useState(
    source.description,
  );

  const [triggerType, setTriggerType] =
    useState<WorkflowTriggerType>(
      source.triggerType,
    );

  const [conditions, setConditions] = useState<
    WorkflowConditionItem[]
  >(() => cloneConditions(source.conditions));

  const [actions, setActions] = useState<
    WorkflowActionItem[]
  >(() => cloneActions(source.actions));

  const [isSaving, setIsSaving] = useState(false);

  const [submitStatus, setSubmitStatus] =
    useState<WorkflowSubmitStatus | null>(null);

  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";

  const workflowDetailsPath =
    isEditMode && workflowId
      ? `${workflowsPath}/${workflowId}`
      : workflowsPath;

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

      const dueInDays =
        action.config.dueInDays?.trim();

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
        isDueInDaysValid &&
        isReminderInHoursValid
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

  async function saveWorkflow(
    status: WorkflowSubmitStatus,
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

    if (isEditMode && !workflowId) {
      setError(
        "Workflow ID is required for editing.",
      );
      return;
    }

    setIsSaving(true);
    setSubmitStatus(status);
    setError(null);

    const requestBody = {
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
    };

    const endpoint = isEditMode
      ? `/api/workflows/${workflowId}`
      : "/api/workflows";

    const method = isEditMode ? "PATCH" : "POST";

    const fallbackError = isEditMode
      ? "Failed to update workflow."
      : "Failed to create workflow.";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data =
        (await response.json()) as WorkflowMutationResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessage(data, fallbackError),
        );
      }

      const savedWorkflowId =
        data.workflow?.id ?? workflowId;

      if (savedWorkflowId) {
        router.push(
          `${workflowsPath}/${savedWorkflowId}`,
        );
      } else {
        router.push(workflowsPath);
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : fallbackError,
      );
    } finally {
      setIsSaving(false);
      setSubmitStatus(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <WorkflowHeader
        mode={mode}
        backPath={workflowDetailsPath}
        canSubmit={canSubmit}
        isSaving={isSaving}
        submitStatus={submitStatus}
        onSubmit={saveWorkflow}
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
                  onChange={(event) => {
                    setDescription(event.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />

                <div className="flex justify-end text-xs text-muted-foreground">
                  {description.length}/500
                </div>
              </div>
            </CardContent>
          </Card>

          <WorkflowTriggerCard
            value={triggerType}
            onChange={(nextTriggerType) => {
              setTriggerType(nextTriggerType);

              if (error) {
                setError(null);
              }
            }}
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

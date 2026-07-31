import { notFound } from "next/navigation";

import { getAIEmployees } from "@/features/ai-employees/queries";
import type {
  WorkflowActionConfig,
  WorkflowActionItem,
  WorkflowActionType,
} from "@/features/workflows/components/workflow-action-card";
import {
  WorkflowBuilder,
  type WorkflowBuilderInitialData,
} from "@/features/workflows/components/workflow-builder";
import type {
  WorkflowConditionItem,
  WorkflowConditionOperator,
} from "@/features/workflows/components/workflow-condition-list";
import type { WorkflowTriggerType } from "@/features/workflows/components/workflow-trigger-card";
import { getWorkflowById } from "@/features/workflows/repositories/workflow.repository";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const dynamic = "force-dynamic";

type EditWorkflowPageProps = {
  params: Promise<{
    locale: string;
    workflowId: string;
  }>;
};

function isJsonObject(
  value: Prisma.JsonValue | null,
): value is Prisma.JsonObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function getStringValue(
  config: Prisma.JsonObject,
  key: string,
): string | undefined {
  const value = config[key];

  return typeof value === "string"
    ? value
    : undefined;
}

function getNumberValue(
  config: Prisma.JsonObject,
  key: string,
): string | undefined {
  const value = config[key];

  return typeof value === "number"
    ? String(value)
    : undefined;
}

function getTaskPriority(
  config: Prisma.JsonObject,
): WorkflowActionConfig["priority"] {
  const value = config.priority;

  if (
    value === "LOW" ||
    value === "MEDIUM" ||
    value === "HIGH" ||
    value === "URGENT"
  ) {
    return value;
  }

  return "MEDIUM";
}

function getContactStatus(
  config: Prisma.JsonObject,
): WorkflowActionConfig["status"] {
  const value = config.status;

  if (
    value === "LEAD" ||
    value === "QUALIFIED" ||
    value === "CUSTOMER" ||
    value === "CLOSED"
  ) {
    return value;
  }

  return "LEAD";
}

function parseActionConfig(
  type: WorkflowActionType,
  value: Prisma.JsonValue | null,
): WorkflowActionConfig {
  const config = isJsonObject(value)
    ? value
    : {};

  switch (type) {
    case "CREATE_TASK":
      return {
        title: getStringValue(config, "title") ?? "",
        description:
          getStringValue(config, "description") ?? "",
        priority: getTaskPriority(config),
        dueInDays:
          getNumberValue(config, "dueInDays") ?? "",
        reminderInHours:
          getNumberValue(
            config,
            "reminderInHours",
          ) ?? "",
      };

    case "ASSIGN_EMPLOYEE":
      return {
        employeeId:
          getStringValue(config, "employeeId") ?? "",
      };

    case "UPDATE_CONTACT_STATUS":
      return {
        status: getContactStatus(config),
      };

    case "ADD_TAG":
      return {
        tag: getStringValue(config, "tag") ?? "",
      };
  }
}

function formatConditionValue(
  value: Prisma.JsonValue | null,
): string {
  if (value === null) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return JSON.stringify(value);
}

export default async function EditWorkflowPage({
  params,
}: EditWorkflowPageProps) {
  const { workflowId } = await params;

  const workspace = await getCurrentWorkspace();

  const [workflow, employees] = await Promise.all([
    getWorkflowById({
      workflowId,
      workspaceId: workspace.id,
    }),
    getAIEmployees({
      workspaceId: workspace.id,
    }),
  ]);

  if (!workflow || !workflow.trigger) {
    notFound();
  }

  if (
    workflow.status === "PAUSED" ||
    workflow.status === "ARCHIVED"
  ) {
    notFound();
  }

  const conditions: WorkflowConditionItem[] =
    workflow.workflowConditions.map(
      (condition) => ({
        id: condition.id,
        field: condition.field,
        operator:
          condition.operator as WorkflowConditionOperator,
        value: formatConditionValue(
          condition.value,
        ),
      }),
    );

  const actions: WorkflowActionItem[] =
    workflow.workflowActions
      .filter(
        (
          action,
        ): action is typeof action & {
          type: WorkflowActionType;
        } =>
          action.type === "CREATE_TASK" ||
          action.type === "ASSIGN_EMPLOYEE" ||
          action.type ===
            "UPDATE_CONTACT_STATUS" ||
          action.type === "ADD_TAG",
      )
      .map((action) => ({
        id: action.id,
        type: action.type,
        config: parseActionConfig(
          action.type,
          action.config,
        ),
      }));

  if (actions.length !== workflow.workflowActions.length) {
    notFound();
  }

  const initialWorkflow: WorkflowBuilderInitialData = {
    name: workflow.name,
    description: workflow.description ?? "",
    status:
      workflow.status === "ACTIVE"
        ? "ACTIVE"
        : "DRAFT",
    triggerType:
      workflow.trigger.type as WorkflowTriggerType,
    conditions,
    actions,
  };

  return (
    <WorkflowBuilder
      mode="edit"
      workflowId={workflow.id}
      initialWorkflow={initialWorkflow}
      employees={employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        status: employee.status,
      }))}
    />
  );
}

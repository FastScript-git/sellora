import type { Prisma } from "@/lib/generated/prisma/client";
import { getWorkflowById } from "../repositories/workflow.repository";

import type {
  WorkflowActionDefinition,
  WorkflowConditionDefinition,
  WorkflowEvent,
  WorkflowExecutionResult,
  WorkflowRuntimeContext,
} from "../types";

import { executeWorkflowActions } from "./action.service";
import { evaluateConditions } from "./condition.service";
import {
  completeWorkflowExecution,
  createWorkflowExecution,
  createWorkflowExecutionLog,
  failWorkflowExecution,
  skipWorkflowExecution,
  startWorkflowExecution,
} from "./execution-log.service";
import { getTriggeredWorkflows } from "./trigger.service";

type TriggeredWorkflow = Awaited<
  ReturnType<typeof getTriggeredWorkflows>
>[number];

type RunWorkflowByIdParams = {
  workflowId: string;
  workspaceId: string;

  contactId?: string;
  conversationId?: string;
  messageId?: string;
  taskId?: string;
  employeeId?: string;

  payload?: Record<string, unknown>;
};

function createRuntimeContext({
  event,
  workflowId,
  executionId,
}: {
  event: WorkflowEvent;
  workflowId: string;
  executionId: string;
}): WorkflowRuntimeContext {
  return {
    workspaceId: event.workspaceId,
    workflowId,
    executionId,
    triggerType: event.triggerType,
    contactId: event.contactId,
    conversationId: event.conversationId,
    messageId: event.messageId,
    taskId: event.taskId,
    employeeId: event.employeeId,
    payload: event.payload,
  };
}

function getWorkflowConditions(
  workflow: TriggeredWorkflow,
): WorkflowConditionDefinition[] {
  return workflow.workflowConditions.map((condition) => ({
    id: condition.id,
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
    position: condition.position,
  }));
}

function getWorkflowActions(
  workflow: TriggeredWorkflow,
): WorkflowActionDefinition[] {
  return workflow.workflowActions.map((action) => ({
    id: action.id,
    type: action.type,
    config: action.config,
    position: action.position,
  }));
}

function createExecutionInput(
  event: WorkflowEvent,
): Prisma.InputJsonObject {
  return {
    workspaceId: event.workspaceId,
    triggerType: event.triggerType,
    ...(event.contactId ? { contactId: event.contactId } : {}),
    ...(event.conversationId
      ? { conversationId: event.conversationId }
      : {}),
    ...(event.messageId ? { messageId: event.messageId } : {}),
    ...(event.taskId ? { taskId: event.taskId } : {}),
    ...(event.employeeId ? { employeeId: event.employeeId } : {}),
    payload: event.payload as Prisma.InputJsonObject,
  };
}

function createActionsOutput(
  actions: WorkflowExecutionResult["actions"],
): Prisma.InputJsonArray {
  return actions.map((action) => ({
    actionId: action.actionId,
    type: action.type,
    success: action.success,
    ...(action.output !== undefined ? { output: action.output } : {}),
    ...(action.error ? { error: action.error } : {}),
  }));
}

async function executeTriggeredWorkflow({
  workflow,
  event,
}: {
  workflow: TriggeredWorkflow;
  event: WorkflowEvent;
}): Promise<WorkflowExecutionResult> {
  const execution = await createWorkflowExecution({
    workflowId: workflow.id,
    input: createExecutionInput(event),
  });

  await startWorkflowExecution({
    executionId: execution.id,
  });

  await createWorkflowExecutionLog({
    executionId: execution.id,
    message: "Workflow execution started",
    metadata: {
      workflowId: workflow.id,
      workflowName: workflow.name,
      triggerType: event.triggerType,
    },
  });

  const context = createRuntimeContext({
    event,
    workflowId: workflow.id,
    executionId: execution.id,
  });

  const conditions = getWorkflowConditions(workflow);
  const actions = getWorkflowActions(workflow);

  const conditionResult = evaluateConditions(
    conditions,
    context.payload,
  );

  await createWorkflowExecutionLog({
    executionId: execution.id,
    message: conditionResult.passed
      ? "Workflow conditions passed"
      : "Workflow conditions failed",
    metadata: {
      passed: conditionResult.passed,
      results: conditionResult.results.map((result) => ({
        conditionId: result.conditionId,
        passed: result.passed,
        ...(result.reason ? { reason: result.reason } : {}),
      })),
    },
  });

  if (!conditionResult.passed) {
    const reason = "Workflow conditions were not satisfied";

    await skipWorkflowExecution({
      executionId: execution.id,
      reason,
    });

    return {
      workflowId: workflow.id,
      executionId: execution.id,
      status: "SKIPPED",
      actions: [],
    };
  }

  const actionResults = await executeWorkflowActions({
    actions,
    context,
  });

  for (const result of actionResults) {
    await createWorkflowExecutionLog({
      executionId: execution.id,
      level: result.success ? "INFO" : "ERROR",
      message: result.success
        ? `Workflow action ${result.type} completed`
        : `Workflow action ${result.type} failed`,
      metadata: {
        actionId: result.actionId,
        actionType: result.type,
        success: result.success,
        ...(result.error ? { error: result.error } : {}),
      },
    });
  }

  const failedAction = actionResults.find(
    (result) => !result.success,
  );

  if (failedAction) {
    const error =
      failedAction.error ??
      `Workflow action ${failedAction.type} failed`;

    await failWorkflowExecution({
      executionId: execution.id,
      error,
      output: {
        actions: createActionsOutput(actionResults),
      },
    });

    return {
      workflowId: workflow.id,
      executionId: execution.id,
      status: "FAILED",
      actions: actionResults,
      error,
    };
  }

  await completeWorkflowExecution({
    executionId: execution.id,
    output: {
      actions: createActionsOutput(actionResults),
    },
  });

  await createWorkflowExecutionLog({
    executionId: execution.id,
    message: "Workflow execution completed",
    metadata: {
      actionCount: actionResults.length,
    },
  });

  return {
    workflowId: workflow.id,
    executionId: execution.id,
    status: "COMPLETED",
    actions: actionResults,
  };
}

export async function runWorkflowEvent(
  event: WorkflowEvent,
): Promise<WorkflowExecutionResult[]> {
  const workflows = await getTriggeredWorkflows({
    workspaceId: event.workspaceId,
    triggerType: event.triggerType,
  });

  const results: WorkflowExecutionResult[] = [];

  for (const workflow of workflows) {
    try {
      const result = await executeTriggeredWorkflow({
        workflow,
        event,
      });

      results.push(result);
    } catch (error) {
      results.push({
        workflowId: workflow.id,
        executionId: "",
        status: "FAILED",
        actions: [],
        error:
          error instanceof Error
            ? error.message
            : "Unexpected workflow execution error",
      });
    }
  }

  return results;
}

export async function runWorkflowById({
  workflowId,
  workspaceId,
  contactId,
  conversationId,
  messageId,
  taskId,
  employeeId,
  payload = {},
}: RunWorkflowByIdParams): Promise<WorkflowExecutionResult | null> {
  const workflow = await getWorkflowById({
    workflowId,
    workspaceId,
  });

  if (!workflow || !workflow.trigger) {
    return null;
  }

  const event: WorkflowEvent = {
    workspaceId,
    triggerType: workflow.trigger.type,
    ...(contactId ? { contactId } : {}),
    ...(conversationId ? { conversationId } : {}),
    ...(messageId ? { messageId } : {}),
    ...(taskId ? { taskId } : {}),
    ...(employeeId ? { employeeId } : {}),
    payload,
  };

  try {
    return await executeTriggeredWorkflow({
      workflow,
      event,
    });
  } catch (error) {
    return {
      workflowId: workflow.id,
      executionId: "",
      status: "FAILED",
      actions: [],
      error:
        error instanceof Error
          ? error.message
          : "Unexpected workflow execution error",
    };
  }
}

import type {
  Prisma,
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowExecutionStatus,
  WorkflowLogLevel,
  WorkflowTriggerType,
} from "@/lib/generated/prisma/client";

export type WorkflowEventPayload = Record<string, unknown>;

export type WorkflowEvent = {
  workspaceId: string;
  triggerType: WorkflowTriggerType;

  contactId?: string;
  conversationId?: string;
  messageId?: string;
  taskId?: string;
  employeeId?: string;

  payload: WorkflowEventPayload;
};

export type WorkflowRuntimeContext = {
  workspaceId: string;
  workflowId: string;
  executionId: string;

  triggerType: WorkflowTriggerType;

  contactId?: string;
  conversationId?: string;
  messageId?: string;
  taskId?: string;
  employeeId?: string;

  payload: WorkflowEventPayload;
};

export type WorkflowConditionDefinition = {
  id: string;
  field: string;
  operator: WorkflowConditionOperator;
  value: Prisma.JsonValue | null;
  position: number;
};

export type WorkflowActionDefinition = {
  id: string;
  type: WorkflowActionType;
  config: Prisma.JsonValue | null;
  position: number;
};

export type WorkflowConditionEvaluationResult = {
  conditionId: string;
  passed: boolean;
  actualValue?: unknown;
  expectedValue?: unknown;
  reason?: string;
};

export type WorkflowConditionsResult = {
  passed: boolean;
  results: WorkflowConditionEvaluationResult[];
};

export type WorkflowActionResult = {
  actionId: string;
  type: WorkflowActionType;
  success: boolean;
  output?: Prisma.InputJsonValue;
  error?: string;
};

export type WorkflowExecutionResult = {
  workflowId: string;
  executionId: string;
  status: WorkflowExecutionStatus;
  actions: WorkflowActionResult[];
  error?: string;
};

export type WorkflowLogInput = {
  executionId: string;
  level: WorkflowLogLevel;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

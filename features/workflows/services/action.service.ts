import { executeAddTagAction } from "../actions/add-tag";
import { executeAssignEmployeeAction } from "../actions/assign-employee";
import { executeCreateTaskAction } from "../actions/create-task";
import { executeUpdateContactStatusAction } from "../actions/update-contact-status";

import type {
  WorkflowActionDefinition,
  WorkflowActionResult,
  WorkflowRuntimeContext,
} from "../types";

type ExecuteWorkflowActionParams = {
  action: WorkflowActionDefinition;
  context: WorkflowRuntimeContext;
};

export async function executeWorkflowAction({
  action,
  context,
}: ExecuteWorkflowActionParams): Promise<WorkflowActionResult> {
  switch (action.type) {
    case "CREATE_TASK":
      return executeCreateTaskAction({
        action,
        context,
      });

    case "ADD_TAG":
      return executeAddTagAction({
        action,
        context,
      });

    case "UPDATE_CONTACT_STATUS":
      return executeUpdateContactStatusAction({
        action,
        context,
      });

    case "ASSIGN_EMPLOYEE":
      return executeAssignEmployeeAction({
        action,
        context,
      });

    case "SEND_EMAIL":
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "SEND_EMAIL action is not implemented yet",
      };

    case "RUN_AI_PROMPT":
      return {
        actionId: action.id,
        type: action.type,
        success: false,
        error: "RUN_AI_PROMPT action is not implemented yet",
      };

    default: {
      const unsupportedAction: never = action.type;

      return {
        actionId: action.id,
        type: unsupportedAction,
        success: false,
        error: "Unsupported workflow action",
      };
    }
  }
}

type ExecuteWorkflowActionsParams = {
  actions: WorkflowActionDefinition[];
  context: WorkflowRuntimeContext;
};

export async function executeWorkflowActions({
  actions,
  context,
}: ExecuteWorkflowActionsParams): Promise<WorkflowActionResult[]> {
  const results: WorkflowActionResult[] = [];

  for (const action of actions) {
    const result = await executeWorkflowAction({
      action,
      context,
    });

    results.push(result);

    if (!result.success) {
      break;
    }
  }

  return results;
}

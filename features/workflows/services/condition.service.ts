import type {
  WorkflowConditionOperator,
} from "@/lib/generated/prisma/client";

import type {
  WorkflowConditionDefinition,
  WorkflowConditionsResult,
  WorkflowEventPayload,
} from "../types";

function getValue(
  payload: WorkflowEventPayload,
  path: string,
): unknown {
  return path
    .split(".")
    .reduce<unknown>((value, key) => {
      if (
        value !== null &&
        typeof value === "object" &&
        key in (value as Record<string, unknown>)
      ) {
        return (value as Record<string, unknown>)[key];
      }

      return undefined;
    }, payload);
}

function evaluateOperator(
  operator: WorkflowConditionOperator,
  actual: unknown,
  expected: unknown,
) {
  switch (operator) {
    case "EQUALS":
      return actual === expected;

    case "NOT_EQUALS":
      return actual !== expected;

    case "CONTAINS":
      return String(actual ?? "").includes(String(expected ?? ""));

    case "NOT_CONTAINS":
      return !String(actual ?? "").includes(String(expected ?? ""));

    case "EXISTS":
      return actual !== undefined && actual !== null;

    case "NOT_EXISTS":
      return actual === undefined || actual === null;

    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: WorkflowConditionDefinition[],
  payload: WorkflowEventPayload,
): WorkflowConditionsResult {
  const results = conditions.map((condition) => {
    const actual = getValue(payload, condition.field);

    const passed = evaluateOperator(
      condition.operator,
      actual,
      condition.value,
    );

    return {
      conditionId: condition.id,
      passed,
      actualValue: actual,
      expectedValue: condition.value,
    };
  });

  return {
    passed: results.every((result) => result.passed),
    results,
  };
}

"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export type WorkflowConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "EXISTS"
  | "NOT_EXISTS";

export type WorkflowConditionItem = {
  id: string;
  field: string;
  operator: WorkflowConditionOperator;
  value: string;
};

type WorkflowConditionListProps = {
  conditions: WorkflowConditionItem[];
  onChange: (conditions: WorkflowConditionItem[]) => void;
};

const fieldOptions = [
  {
    value: "contact.email",
    label: "Contact email",
  },
  {
    value: "contact.phone",
    label: "Contact phone",
  },
  {
    value: "contact.company",
    label: "Contact company",
  },
  {
    value: "contact.jobTitle",
    label: "Contact job title",
  },
  {
    value: "contact.status",
    label: "Contact status",
  },
  {
    value: "contact.sentiment",
    label: "Contact sentiment",
  },
  {
    value: "contact.leadScore",
    label: "Contact lead score",
  },
  {
    value: "message.content",
    label: "Message content",
  },
  {
    value: "task.status",
    label: "Task status",
  },
  {
    value: "payload.pipelineStage",
    label: "Pipeline stage",
  },
];

const operatorOptions: Array<{
  value: WorkflowConditionOperator;
  label: string;
}> = [
  {
    value: "EQUALS",
    label: "Equals",
  },
  {
    value: "NOT_EQUALS",
    label: "Does not equal",
  },
  {
    value: "GREATER_THAN",
    label: "Greater than",
  },
  {
    value: "GREATER_THAN_OR_EQUAL",
    label: "Greater than or equal",
  },
  {
    value: "LESS_THAN",
    label: "Less than",
  },
  {
    value: "LESS_THAN_OR_EQUAL",
    label: "Less than or equal",
  },
  {
    value: "CONTAINS",
    label: "Contains",
  },
  {
    value: "NOT_CONTAINS",
    label: "Does not contain",
  },
  {
    value: "EXISTS",
    label: "Exists",
  },
  {
    value: "NOT_EXISTS",
    label: "Does not exist",
  },
];

function createCondition(): WorkflowConditionItem {
  return {
    id: crypto.randomUUID(),
    field: "contact.status",
    operator: "EQUALS",
    value: "",
  };
}

function operatorNeedsValue(
  operator: WorkflowConditionOperator,
): boolean {
  return operator !== "EXISTS" && operator !== "NOT_EXISTS";
}

export function WorkflowConditionList({
  conditions,
  onChange,
}: WorkflowConditionListProps) {
  function addCondition(): void {
    onChange([...conditions, createCondition()]);
  }

  function updateCondition(
    conditionId: string,
    updates: Partial<WorkflowConditionItem>,
  ): void {
    onChange(
      conditions.map((condition) =>
        condition.id === conditionId
          ? {
              ...condition,
              ...updates,
            }
          : condition,
      ),
    );
  }

  function removeCondition(conditionId: string): void {
    onChange(
      conditions.filter(
        (condition) => condition.id !== conditionId,
      ),
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <CardTitle>Conditions</CardTitle>
            <CardDescription>
              Limit when the workflow should continue after the
              trigger occurs.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
          >
            <Plus />
            Add condition
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {conditions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm font-medium">
              No conditions configured
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              The workflow will continue every time its trigger
              occurs.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={addCondition}
            >
              <Plus />
              Add first condition
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {conditions.map((condition, index) => {
              const needsValue = operatorNeedsValue(
                condition.operator,
              );

              return (
                <div
                  key={condition.id}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">
                      Condition {index + 1}
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove condition ${index + 1}`}
                      onClick={() =>
                        removeCondition(condition.id)
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Field</Label>

                      <Select
                        value={condition.field}
                        onValueChange={(value) => {
                          if (value) {
                            updateCondition(condition.id, {
                              field: String(value),
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {fieldOptions.map((option) => (
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

                    <div className="space-y-2">
                      <Label>Operator</Label>

                      <Select
                        value={condition.operator}
                        onValueChange={(value) => {
                          if (!value) {
                            return;
                          }

                          const operator =
                            value as WorkflowConditionOperator;

                          updateCondition(condition.id, {
                            operator,
                            ...(!operatorNeedsValue(operator)
                              ? { value: "" }
                              : {}),
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {operatorOptions.map((option) => (
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

                    <div className="space-y-2">
                      <Label htmlFor={`condition-${condition.id}`}>
                        Value
                      </Label>

                      <Input
                        id={`condition-${condition.id}`}
                        value={condition.value}
                        disabled={!needsValue}
                        placeholder={
                          needsValue
                            ? "Enter value"
                            : "Not required"
                        }
                        onChange={(event) =>
                          updateCondition(condition.id, {
                            value: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {index < conditions.length - 1 ? (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        AND
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

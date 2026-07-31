"use client";

import {
  ArrowDown,
  ArrowUp,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

export type WorkflowActionType =
  | "CREATE_TASK"
  | "ASSIGN_EMPLOYEE"
  | "UPDATE_CONTACT_STATUS"
  | "ADD_TAG";

export type WorkflowActionConfig = {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueInDays?: string;
  reminderInHours?: string;
  employeeId?: string;
  status?: "LEAD" | "QUALIFIED" | "CUSTOMER" | "CLOSED";
  tag?: string;
};

export type WorkflowActionItem = {
  id: string;
  type: WorkflowActionType;
  config: WorkflowActionConfig;
};

type WorkflowActionCardProps = {
  action: WorkflowActionItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (
    actionId: string,
    updates: Partial<WorkflowActionItem>,
  ) => void;
  onMoveUp: (actionId: string) => void;
  onMoveDown: (actionId: string) => void;
  onRemove: (actionId: string) => void;
};

const actionOptions: Array<{
  value: WorkflowActionType;
  label: string;
  description: string;
}> = [
  {
    value: "CREATE_TASK",
    label: "Create task",
    description:
      "Create a follow-up task when the workflow runs.",
  },
  {
    value: "ASSIGN_EMPLOYEE",
    label: "Assign AI employee",
    description:
      "Assign an AI employee to the active conversation.",
  },
  {
    value: "UPDATE_CONTACT_STATUS",
    label: "Update contact status",
    description:
      "Move the contact to another lifecycle status.",
  },
  {
    value: "ADD_TAG",
    label: "Add tag",
    description:
      "Add a tag to the contact without creating duplicates.",
  },
];

export function createDefaultActionConfig(
  type: WorkflowActionType,
): WorkflowActionConfig {
  switch (type) {
    case "CREATE_TASK":
      return {
        title: "",
        description: "",
        priority: "MEDIUM",
        dueInDays: "",
        reminderInHours: "",
      };

    case "ASSIGN_EMPLOYEE":
      return {
        employeeId: "",
      };

    case "UPDATE_CONTACT_STATUS":
      return {
        status: "LEAD",
      };

    case "ADD_TAG":
      return {
        tag: "",
      };
  }
}

export function isWorkflowActionValid(
  action: WorkflowActionItem,
): boolean {
  switch (action.type) {
    case "CREATE_TASK":
      return Boolean(action.config.title?.trim());

    case "ASSIGN_EMPLOYEE":
      return Boolean(action.config.employeeId?.trim());

    case "UPDATE_CONTACT_STATUS":
      return Boolean(action.config.status);

    case "ADD_TAG":
      return Boolean(action.config.tag?.trim());
  }
}

function getActionDescription(
  type: WorkflowActionType,
): string {
  return (
    actionOptions.find((option) => option.value === type)
      ?.description ?? ""
  );
}

function ActionConfiguration({
  action,
  onConfigChange,
}: {
  action: WorkflowActionItem;
  onConfigChange: (
    updates: Partial<WorkflowActionConfig>,
  ) => void;
}) {
  switch (action.type) {
    case "CREATE_TASK":
      return (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label
              htmlFor={`action-${action.id}-title`}
            >
              Task title
            </Label>

            <Input
              id={`action-${action.id}-title`}
              value={action.config.title ?? ""}
              maxLength={160}
              placeholder="Example: Follow up with qualified lead"
              onChange={(event) =>
                onConfigChange({
                  title: event.target.value,
                })
              }
            />

            <p className="text-xs text-muted-foreground">
              Required. This title will appear in the task list.
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`action-${action.id}-description`}
            >
              Description
            </Label>

            <Textarea
              id={`action-${action.id}-description`}
              value={action.config.description ?? ""}
              rows={3}
              maxLength={500}
              placeholder="Add instructions or useful context..."
              onChange={(event) =>
                onConfigChange({
                  description: event.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Priority</Label>

              <Select
                value={action.config.priority ?? "MEDIUM"}
                onValueChange={(value) => {
                  if (
                    value === "LOW" ||
                    value === "MEDIUM" ||
                    value === "HIGH" ||
                    value === "URGENT"
                  ) {
                    onConfigChange({
                      priority: value,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">
                    Medium
                  </SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`action-${action.id}-due-days`}
              >
                Due in days
              </Label>

              <Input
                id={`action-${action.id}-due-days`}
                type="number"
                min="0"
                max="365"
                value={action.config.dueInDays ?? ""}
                placeholder="3"
                onChange={(event) =>
                  onConfigChange({
                    dueInDays: event.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`action-${action.id}-reminder-hours`}
              >
                Reminder in hours
              </Label>

              <Input
                id={`action-${action.id}-reminder-hours`}
                type="number"
                min="0"
                max="8760"
                value={
                  action.config.reminderInHours ?? ""
                }
                placeholder="24"
                onChange={(event) =>
                  onConfigChange({
                    reminderInHours: event.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      );

    case "ASSIGN_EMPLOYEE":
      return (
        <div className="space-y-2">
          <Label
            htmlFor={`action-${action.id}-employee`}
          >
            AI employee ID
          </Label>

          <Input
            id={`action-${action.id}-employee`}
            value={action.config.employeeId ?? ""}
            placeholder="Enter the AI employee ID"
            onChange={(event) =>
              onConfigChange({
                employeeId: event.target.value,
              })
            }
          />

          <p className="text-xs text-muted-foreground">
            The employee must belong to the current workspace and
            must not be archived.
          </p>
        </div>
      );

    case "UPDATE_CONTACT_STATUS":
      return (
        <div className="space-y-2">
          <Label>New contact status</Label>

          <Select
            value={action.config.status ?? "LEAD"}
            onValueChange={(value) => {
              if (
                value === "LEAD" ||
                value === "QUALIFIED" ||
                value === "CUSTOMER" ||
                value === "CLOSED"
              ) {
                onConfigChange({
                  status: value,
                });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="LEAD">Lead</SelectItem>
              <SelectItem value="QUALIFIED">
                Qualified
              </SelectItem>
              <SelectItem value="CUSTOMER">
                Customer
              </SelectItem>
              <SelectItem value="CLOSED">
                Closed
              </SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            This action requires a contact in the workflow runtime
            context.
          </p>
        </div>
      );

    case "ADD_TAG":
      return (
        <div className="space-y-2">
          <Label htmlFor={`action-${action.id}-tag`}>
            Contact tag
          </Label>

          <Input
            id={`action-${action.id}-tag`}
            value={action.config.tag ?? ""}
            maxLength={80}
            placeholder="Example: Hot lead"
            onChange={(event) =>
              onConfigChange({
                tag: event.target.value,
              })
            }
          />

          <p className="text-xs text-muted-foreground">
            Sellora will not add a duplicate tag when the contact
            already has it.
          </p>
        </div>
      );
  }
}

export function WorkflowActionCard({
  action,
  index,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: WorkflowActionCardProps) {
  function updateConfig(
    updates: Partial<WorkflowActionConfig>,
  ): void {
    onChange(action.id, {
      config: {
        ...action.config,
        ...updates,
      },
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            Action {index + 1}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {getActionDescription(action.type)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            aria-label={`Move action ${index + 1} up`}
            onClick={() => onMoveUp(action.id)}
          >
            <ArrowUp />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            aria-label={`Move action ${index + 1} down`}
            onClick={() => onMoveDown(action.id)}
          >
            <ArrowDown />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove action ${index + 1}`}
            onClick={() => onRemove(action.id)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Action type</Label>

          <Select
            value={action.type}
            onValueChange={(value) => {
              if (
                value === "CREATE_TASK" ||
                value === "ASSIGN_EMPLOYEE" ||
                value === "UPDATE_CONTACT_STATUS" ||
                value === "ADD_TAG"
              ) {
                onChange(action.id, {
                  type: value,
                  config: createDefaultActionConfig(value),
                });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {actionOptions.map((option) => (
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

        <div className="border-t pt-5">
          <ActionConfiguration
            action={action}
            onConfigChange={updateConfig}
          />
        </div>
      </div>
    </div>
  );
}

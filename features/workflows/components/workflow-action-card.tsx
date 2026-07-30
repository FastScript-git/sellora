"use client";

import {
  ArrowDown,
  ArrowUp,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WorkflowActionType =
  | "CREATE_TASK"
  | "ASSIGN_EMPLOYEE"
  | "UPDATE_CONTACT_STATUS"
  | "ADD_TAG"
  | "SEND_EMAIL"
  | "RUN_AI_PROMPT";

export type WorkflowActionItem = {
  id: string;
  type: WorkflowActionType;
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
      "Create a follow-up task for the contact or workspace team.",
  },
  {
    value: "ASSIGN_EMPLOYEE",
    label: "Assign AI employee",
    description:
      "Assign an AI employee to handle the contact or conversation.",
  },
  {
    value: "UPDATE_CONTACT_STATUS",
    label: "Update contact status",
    description:
      "Move the contact to another lifecycle or pipeline status.",
  },
  {
    value: "ADD_TAG",
    label: "Add tag",
    description:
      "Attach a tag to the contact for segmentation and filtering.",
  },
  {
    value: "SEND_EMAIL",
    label: "Send email",
    description:
      "Send an automated email to the contact.",
  },
  {
    value: "RUN_AI_PROMPT",
    label: "Run AI prompt",
    description:
      "Run a custom AI instruction using workflow context.",
  },
];

function getActionDescription(
  type: WorkflowActionType,
): string {
  return (
    actionOptions.find((option) => option.value === type)
      ?.description ?? ""
  );
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
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
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

      <div className="space-y-2">
        <Label>Action type</Label>

        <Select
          value={action.type}
          onValueChange={(value) => {
            if (value) {
              onChange(action.id, {
                type: value as WorkflowActionType,
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
    </div>
  );
}

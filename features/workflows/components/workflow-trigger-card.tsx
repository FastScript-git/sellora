"use client";

import { CheckCircle2, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WorkflowTriggerType =
  | "CONTACT_CREATED"
  | "MESSAGE_RECEIVED"
  | "LEAD_QUALIFIED"
  | "TASK_COMPLETED"
  | "PIPELINE_STAGE_CHANGED";

type TriggerOption = {
  value: WorkflowTriggerType;
  label: string;
  description: string;
};

const triggerOptions: TriggerOption[] = [
  {
    value: "CONTACT_CREATED",
    label: "Contact created",
    description:
      "Run the workflow when a new contact is created in the workspace.",
  },
  {
    value: "MESSAGE_RECEIVED",
    label: "Message received",
    description:
      "Run the workflow when Sellora receives a new customer message.",
  },
  {
    value: "LEAD_QUALIFIED",
    label: "Lead qualified",
    description:
      "Run the workflow when a contact becomes a qualified lead.",
  },
  {
    value: "TASK_COMPLETED",
    label: "Task completed",
    description:
      "Run the workflow after a workspace task is completed.",
  },
  {
    value: "PIPELINE_STAGE_CHANGED",
    label: "Pipeline stage changed",
    description:
      "Run the workflow when a contact moves to another pipeline stage.",
  },
];

type WorkflowTriggerCardProps = {
  value: WorkflowTriggerType;
  onChange: (value: WorkflowTriggerType) => void;
};

export function getWorkflowTriggerLabel(
  value: WorkflowTriggerType,
): string {
  return (
    triggerOptions.find((option) => option.value === value)?.label ??
    "Unknown trigger"
  );
}

export function WorkflowTriggerCard({
  value,
  onChange,
}: WorkflowTriggerCardProps) {
  const selectedTrigger =
    triggerOptions.find((option) => option.value === value) ??
    triggerOptions[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <Sparkles className="size-4" />
          </div>

          <div className="space-y-1">
            <CardTitle>Trigger</CardTitle>
            <CardDescription>
              Choose the event that starts the workflow.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Trigger event</Label>

          <Select
            value={value}
            onValueChange={(nextValue) => {
              if (nextValue) {
                onChange(nextValue as WorkflowTriggerType);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {triggerOptions.map((option) => (
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

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {selectedTrigger.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedTrigger.description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

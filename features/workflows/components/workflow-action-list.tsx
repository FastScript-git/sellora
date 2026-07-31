"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createDefaultActionConfig,
  WorkflowActionCard,
  type WorkflowActionItem,
  type WorkflowEmployeeOption,
} from "@/features/workflows/components/workflow-action-card";

type WorkflowActionListProps = {
  actions: WorkflowActionItem[];
  employees: WorkflowEmployeeOption[];
  onChange: (actions: WorkflowActionItem[]) => void;
};

function createAction(): WorkflowActionItem {
  return {
    id: crypto.randomUUID(),
    type: "CREATE_TASK",
    config: createDefaultActionConfig("CREATE_TASK"),
  };
}

export function WorkflowActionList({
  actions,
  employees,
  onChange,
}: WorkflowActionListProps) {
  function addAction(): void {
    onChange([...actions, createAction()]);
  }

  function updateAction(
    actionId: string,
    updates: Partial<WorkflowActionItem>,
  ): void {
    onChange(
      actions.map((action) =>
        action.id === actionId
          ? {
              ...action,
              ...updates,
            }
          : action,
      ),
    );
  }

  function removeAction(actionId: string): void {
    onChange(
      actions.filter((action) => action.id !== actionId),
    );
  }

  function moveAction(
    actionId: string,
    direction: "up" | "down",
  ): void {
    const currentIndex = actions.findIndex(
      (action) => action.id === actionId,
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= actions.length
    ) {
      return;
    }

    const nextActions = [...actions];

    [
      nextActions[currentIndex],
      nextActions[targetIndex],
    ] = [
      nextActions[targetIndex],
      nextActions[currentIndex],
    ];

    onChange(nextActions);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <CardTitle>Actions</CardTitle>

            <CardDescription>
              Define what Sellora should do after the trigger and
              conditions are matched.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAction}
          >
            <Plus />
            Add action
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {actions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm font-medium">
              No actions configured
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add at least one action before saving the workflow.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={addAction}
            >
              <Plus />
              Add first action
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((action, index) => (
              <WorkflowActionCard
                key={action.id}
                action={action}
                index={index}
                isFirst={index === 0}
                isLast={index === actions.length - 1}
                employees={employees}
                onChange={updateAction}
                onMoveUp={(actionId) =>
                  moveAction(actionId, "up")
                }
                onMoveDown={(actionId) =>
                  moveAction(actionId, "down")
                }
                onRemove={removeAction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

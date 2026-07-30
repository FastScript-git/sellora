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
  WorkflowActionCard,
  type WorkflowActionItem,
} from "@/features/workflows/components/workflow-action-card";

type WorkflowActionListProps = {
  actions: WorkflowActionItem[];
  onChange: (actions: WorkflowActionItem[]) => void;
};

function createAction(): WorkflowActionItem {
  return {
    id: crypto.randomUUID(),
    type: "CREATE_TASK",
  };
}

export function WorkflowActionList({
  actions,
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
    const currentAction = nextActions[currentIndex];
    const targetAction = nextActions[targetIndex];

    nextActions[currentIndex] = targetAction;
    nextActions[targetIndex] = currentAction;

    onChange(nextActions);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <CardTitle>Actions</CardTitle>

            <CardDescription>
              Choose what Sellora should do after the trigger and
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
              Add an action to define what the workflow should do.
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

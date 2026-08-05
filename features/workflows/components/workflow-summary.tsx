import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getWorkflowTriggerLabel,
  type WorkflowTriggerType,
} from "@/features/workflows/components/workflow-trigger-card";

type WorkflowSummaryProps = {
  name: string;
  triggerType: WorkflowTriggerType;
  conditionsCount: number;
  actionsCount: number;
};

export function WorkflowSummary({
  name,
  triggerType,
  conditionsCount,
  actionsCount,
}: WorkflowSummaryProps) {
  return (
    <aside className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Workflow summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </p>

            <p className="font-medium">
              {name.trim() || "Untitled workflow"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Trigger
            </p>

            <p>{getWorkflowTriggerLabel(triggerType)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Conditions
            </p>

            <p>
              {conditionsCount === 0
                ? "No conditions"
                : `${conditionsCount} condition${
                    conditionsCount === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </p>

            <p>
              {actionsCount === 0
                ? "No actions"
                : `${actionsCount} action${
                    actionsCount === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-dashed p-4">
        <p className="text-sm font-medium">
          Builder progress
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Workflow details, trigger, conditions and actions
          are connected and ready to be saved.
        </p>
      </div>
    </aside>
  );
}

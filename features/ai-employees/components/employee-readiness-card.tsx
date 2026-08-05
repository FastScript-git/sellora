import {
  Check,
  Circle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmployeeReadinessItem = {
  key: string;
  label: string;
  complete: boolean;
};

type EmployeeReadinessCardProps = {
  title: string;
  description: string;
  readyLabel: string;
  needsSetupLabel: string;
  completedLabel: string;
  readinessPercentage: number;
  completedItems: number;
  items: EmployeeReadinessItem[];
};

export function EmployeeReadinessCard({
  title,
  description,
  readyLabel,
  needsSetupLabel,
  completedLabel,
  readinessPercentage,
  completedItems,
  items,
}: EmployeeReadinessCardProps) {
  const isReady =
    readinessPercentage >= 70;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>

            <CardDescription className="mt-1 max-w-2xl leading-6">
              {description}
            </CardDescription>
          </div>

          <div className="shrink-0">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                isReady
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />

              {isReady
                ? readyLabel
                : needsSetupLabel}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {readinessPercentage}%
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {completedItems}/{items.length}{" "}
                {completedLabel.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isReady
                  ? "bg-emerald-500"
                  : "bg-primary",
              )}
              style={{
                width: `${readinessPercentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex min-w-0 items-center gap-3 rounded-xl border bg-muted/10 px-3 py-3"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                  item.complete
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "bg-background text-muted-foreground",
                )}
              >
                {item.complete ? (
                  <Check className="size-4" />
                ) : (
                  <Circle className="size-4" />
                )}
              </span>

              <span
                className={cn(
                  "min-w-0 break-words text-sm",
                  item.complete
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

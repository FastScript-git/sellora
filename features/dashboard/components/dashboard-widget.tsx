import type {
  ComponentType,
  ReactNode,
} from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardWidgetIcon = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

type DashboardWidgetProps = {
  title: string;
  description?: string;
  icon?: DashboardWidgetIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function DashboardWidget({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
}: DashboardWidgetProps) {
  return (
    <Card
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden shadow-xs",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "shrink-0 border-b px-4 py-4 sm:px-5",
          headerClassName,
        )}
      >
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                <Icon
                  aria-hidden={true}
                  className="size-4"
                />
              </span>
            ) : null}

            <div className="min-w-0">
              <CardTitle className="text-base">
                {title}
              </CardTitle>

              {description ? (
                <CardDescription className="mt-1 leading-5">
                  {description}
                </CardDescription>
              ) : null}
            </div>
          </div>

          {action ? (
            <div className="flex w-full shrink-0 items-center sm:w-auto">
              {action}
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "min-h-0 min-w-0 flex-1 p-0",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

type DashboardWidgetEmptyStateProps = {
  icon: DashboardWidgetIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function DashboardWidgetEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: DashboardWidgetEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center px-5 py-8 text-center sm:px-6",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground">
        <Icon
          aria-hidden={true}
          className="size-5"
        />
      </span>

      <p className="mt-4 text-base font-semibold tracking-tight">
        {title}
      </p>

      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-5 flex w-full justify-center sm:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

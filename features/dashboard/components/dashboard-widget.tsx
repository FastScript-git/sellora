import type {
  ComponentType,
  ReactNode,
} from "react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { DashboardSectionHeader } from "@/features/dashboard/components/dashboard-section-header";
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
  compact?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function DashboardWidget({
  title,
  description,
  icon,
  action,
  children,
  compact = false,
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
          "shrink-0 border-b",
          compact
            ? "px-3 py-3 sm:px-4"
            : "px-4 py-4 sm:px-5",
          headerClassName,
        )}
      >
        <DashboardSectionHeader
          title={title}
          description={description}
          icon={icon}
          action={action}
          compact={compact}
        />
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
  compact?: boolean;
  className?: string;
};

export function DashboardWidgetEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: DashboardWidgetEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact
          ? "min-h-44 px-4 py-6"
          : "min-h-56 px-5 py-8 sm:px-6",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground",
          compact
            ? "size-10"
            : "size-11",
        )}
      >
        <Icon
          aria-hidden={true}
          className={
            compact
              ? "size-4"
              : "size-5"
          }
        />
      </span>

      <p
        className={cn(
          "font-semibold tracking-tight",
          compact
            ? "mt-3 text-sm"
            : "mt-4 text-base",
        )}
      >
        {title}
      </p>

      {description ? (
        <p
          className={cn(
            "max-w-sm text-muted-foreground",
            compact
              ? "mt-1.5 text-xs leading-5"
              : "mt-2 text-sm leading-6",
          )}
        >
          {description}
        </p>
      ) : null}

      {action ? (
        <div
          className={cn(
            "flex w-full justify-center sm:w-auto",
            compact
              ? "mt-4"
              : "mt-5",
          )}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

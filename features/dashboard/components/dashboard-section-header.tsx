import type {
  ComponentType,
  ReactNode,
} from "react";

import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardSectionHeaderIcon =
  ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;

type DashboardSectionHeaderProps = {
  title: string;
  description?: string;
  icon?: DashboardSectionHeaderIcon;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
  contentClassName?: string;
  actionClassName?: string;
};

export function DashboardSectionHeader({
  title,
  description,
  icon: Icon,
  action,
  compact = false,
  className,
  contentClassName,
  actionClassName,
}: DashboardSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3",
        "sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-start gap-3",
          contentClassName,
        )}
      >
        {Icon ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground",
              compact
                ? "size-8"
                : "size-9",
            )}
          >
            <Icon
              aria-hidden={true}
              className={
                compact
                  ? "size-3.5"
                  : "size-4"
              }
            />
          </span>
        ) : null}

        <div className="min-w-0">
          <CardTitle
            className={cn(
              compact
                ? "text-sm"
                : "text-base",
            )}
          >
            {title}
          </CardTitle>

          {description ? (
            <CardDescription
              className={cn(
                "mt-1",
                compact
                  ? "text-xs leading-5"
                  : "leading-5",
              )}
            >
              {description}
            </CardDescription>
          ) : null}
        </div>
      </div>

      {action ? (
        <div
          className={cn(
            "flex w-full shrink-0 items-center",
            "sm:w-auto sm:justify-end",
            actionClassName,
          )}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

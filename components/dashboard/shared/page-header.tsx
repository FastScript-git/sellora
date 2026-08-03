import type {
  ComponentType,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type HeaderIcon = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: HeaderIcon;
  actions?: ReactNode;
  stats?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  actions,
  stats,
  aside,
  compact = false,
  className,
  contentClassName,
  actionsClassName,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-w-0 flex-col gap-4",
        "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0 flex-1",
          contentClassName,
        )}
      >
        {eyebrow ? (
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {Icon ? (
              <Icon
                aria-hidden={true}
                className="size-3.5 shrink-0"
              />
            ) : null}

            <span className="truncate">
              {eyebrow}
            </span>
          </div>
        ) : Icon ? (
          <span className="mb-3 flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground">
            <Icon
              aria-hidden={true}
              className="size-4"
            />
          </span>
        ) : null}

        <h1
          className={cn(
            "font-semibold tracking-tight",
            compact
              ? "text-xl sm:text-2xl"
              : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </h1>

        {description ? (
          <p
            className={cn(
              "max-w-3xl text-sm leading-6 text-muted-foreground",
              compact ? "mt-1" : "mt-2",
            )}
          >
            {description}
          </p>
        ) : null}

        {stats ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              compact ? "mt-3" : "mt-4",
            )}
          >
            {stats}
          </div>
        ) : null}
      </div>

      {actions || aside ? (
        <div
          className={cn(
            "flex min-w-0 shrink-0 flex-col gap-3",
            "sm:flex-row sm:flex-wrap sm:items-center",
            "lg:max-w-[48%] lg:justify-end",
            actionsClassName,
          )}
        >
          {aside ? (
            <div className="min-w-0">
              {aside}
            </div>
          ) : null}

          {actions ? (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

type PageHeaderStatProps = {
  label: string;
  value: ReactNode;
  icon?: HeaderIcon;
  compact?: boolean;
  className?: string;
};

export function PageHeaderStat({
  label,
  value,
  icon: Icon,
  compact = false,
  className,
}: PageHeaderStatProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border bg-card",
        compact
          ? "px-3 py-2"
          : "px-4 py-3",
        className,
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
            className="size-3.5"
          />
        </span>
      ) : null}

      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">
          {label}
        </p>

        <div
          className={cn(
            "truncate font-semibold tabular-nums",
            compact
              ? "mt-0.5 text-base"
              : "mt-1 text-2xl",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

type PageHeaderNoteProps = {
  icon?: HeaderIcon;
  children: ReactNode;
  tone?: "default" | "success" | "warning";
  className?: string;
};

export function PageHeaderNote({
  icon: Icon,
  children,
  tone = "default",
  className,
}: PageHeaderNoteProps) {
  return (
    <div
      className={cn(
        "flex max-w-md items-start gap-2 rounded-xl border bg-card px-3 py-2.5",
        tone === "success" &&
          "border-emerald-500/20 bg-emerald-500/5",
        tone === "warning" &&
          "border-amber-500/20 bg-amber-500/5",
        className,
      )}
    >
      {Icon ? (
        <Icon
          aria-hidden={true}
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground",
            tone === "success" &&
              "text-emerald-500",
            tone === "warning" &&
              "text-amber-500",
          )}
        />
      ) : null}

      <div className="min-w-0 text-xs leading-5 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

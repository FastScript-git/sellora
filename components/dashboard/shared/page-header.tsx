import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}

        {stats ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {stats}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

type PageHeaderStatProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function PageHeaderStat({
  label,
  value,
  className,
}: PageHeaderStatProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <div className="mt-1 text-2xl font-semibold">
        {value}
      </div>
    </div>
  );
}
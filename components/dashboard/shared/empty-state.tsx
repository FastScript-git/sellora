import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive";
};

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  footer?: ReactNode;
  compact?: boolean;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  footer,
  compact = false,
  tone = "default",
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card text-center",
        compact
          ? "min-h-56 px-5 py-8"
          : "min-h-[360px] px-6 py-12 sm:px-8",
        tone === "success" &&
          "border-emerald-500/25 bg-emerald-500/5",
        tone === "warning" &&
          "border-amber-500/25 bg-amber-500/5",
        tone === "danger" &&
          "border-destructive/25 bg-destructive/5",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground",
          compact ? "size-11" : "size-14",
          tone === "success" &&
            "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
          tone === "warning" &&
            "border-amber-500/25 bg-amber-500/10 text-amber-500",
          tone === "danger" &&
            "border-destructive/25 bg-destructive/10 text-destructive",
        )}
      >
        <Icon
          aria-hidden="true"
          className={compact ? "size-5" : "size-6"}
        />
      </span>

      <h2
        className={cn(
          "font-semibold tracking-tight",
          compact ? "mt-4 text-base" : "mt-5 text-lg",
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "max-w-md text-muted-foreground",
            compact
              ? "mt-2 text-xs leading-5"
              : "mt-2 text-sm leading-6",
          )}
        >
          {description}
        </p>
      ) : null}

      {action || secondaryAction ? (
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 sm:w-auto sm:flex-row",
            compact ? "mt-5" : "mt-6",
          )}
        >
          {action ? (
            <EmptyStateActionButton
              action={action}
              fullWidth
            />
          ) : null}

          {secondaryAction ? (
            <EmptyStateActionButton
              action={{
                ...secondaryAction,
                variant:
                  secondaryAction.variant ??
                  "outline",
              }}
              fullWidth
            />
          ) : null}
        </div>
      ) : null}

      {footer ? (
        <div
          className={cn(
            "max-w-lg text-xs leading-5 text-muted-foreground",
            compact ? "mt-5" : "mt-6",
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}

function EmptyStateActionButton({
  action,
  fullWidth,
}: {
  action: EmptyStateAction;
  fullWidth?: boolean;
}) {
  const Icon = action.icon;
  const variant = action.variant ?? "default";

  const content = (
    <>
      {Icon ? (
        <Icon
          aria-hidden="true"
          className="size-4"
        />
      ) : null}

      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Link
        href={action.href}
        className={cn(
          buttonVariants({
            variant,
          }),
          fullWidth &&
            "w-full sm:w-auto",
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={action.onClick}
      className={cn(
        fullWidth && "w-full sm:w-auto",
      )}
    >
      {content}
    </Button>
  );
}

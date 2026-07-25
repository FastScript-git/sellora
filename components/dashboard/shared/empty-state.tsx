import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import Link from "next/link";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  footer?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  footer,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-8 py-12 text-center",
        className,
      )}
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>

      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {action ? (
        <div className="mt-8">
          {action.href ? (
            <Link
              href={action.href}
              className={buttonVariants()}
            >
              {action.label}
            </Link>
          ) : (
            <Button
              type="button"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      ) : null}

      {footer ? (
        <div className="mt-8">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
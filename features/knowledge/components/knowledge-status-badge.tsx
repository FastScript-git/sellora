"use client";

import { useTranslations } from "next-intl";

import type { KnowledgeSourceStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type KnowledgeStatusBadgeProps = {
  status: KnowledgeSourceStatus;
};

const statusConfig: Record<
  KnowledgeSourceStatus,
  {
    translationKey:
      | "pending"
      | "indexing"
      | "indexed"
      | "failed";
    className: string;
    dotClassName: string;
  }
> = {
  PENDING: {
    translationKey: "pending",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-500",
    dotClassName: "bg-amber-500",
  },
  INDEXING: {
    translationKey: "indexing",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-500",
    dotClassName: "bg-blue-500",
  },
  INDEXED: {
    translationKey: "indexed",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    dotClassName: "bg-emerald-500",
  },
  FAILED: {
    translationKey: "failed",
    className:
      "border-red-500/30 bg-red-500/10 text-red-500",
    dotClassName: "bg-red-500",
  },
};

export function KnowledgeStatusBadge({
  status,
}: KnowledgeStatusBadgeProps) {
  const t = useTranslations(
    "aiEmployeeKnowledge.statuses",
  );

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          config.dotClassName,
        )}
      />

      {t(config.translationKey)}
    </span>
  );
}

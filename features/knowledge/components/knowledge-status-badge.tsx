import type { KnowledgeSourceStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type KnowledgeStatusBadgeProps = {
  status: KnowledgeSourceStatus;
};

const statusConfig: Record<
  KnowledgeSourceStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dotClassName: "bg-amber-400",
  },
  INDEXING: {
    label: "Indexing",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    dotClassName: "bg-blue-400",
  },
  INDEXED: {
    label: "Indexed",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dotClassName: "bg-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className:
      "border-red-500/30 bg-red-500/10 text-red-400",
    dotClassName: "bg-red-400",
  },
};

export function KnowledgeStatusBadge({
  status,
}: KnowledgeStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", config.dotClassName)}
      />

      {config.label}
    </span>
  );
}
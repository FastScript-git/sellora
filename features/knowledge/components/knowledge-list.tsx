import {
  BookOpen,
  FileText,
  Globe,
  HelpCircle,
  NotebookPen,
} from "lucide-react";

import type {
  KnowledgeSource,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";

import { KnowledgeStatusBadge } from "@/features/knowledge/components/knowledge-status-badge";

type KnowledgeSourceWithCount = KnowledgeSource & {
  _count: {
    chunks: number;
  };
};

type KnowledgeListProps = {
  sources: KnowledgeSourceWithCount[];
};

function getIcon(type: KnowledgeSourceType) {
  switch (type) {
    case "WEBSITE":
      return Globe;

    case "PDF":
      return FileText;

    case "FAQ":
      return HelpCircle;

    case "NOTE":
      return NotebookPen;

    default:
      return BookOpen;
  }
}

function getTypeLabel(type: KnowledgeSourceType) {
  switch (type) {
    case "WEBSITE":
      return "Website";

    case "PDF":
      return "PDF";

    case "FAQ":
      return "FAQ";

    case "NOTE":
      return "Note";

    default:
      return "Knowledge";
  }
}

export function KnowledgeList({
  sources,
}: KnowledgeListProps) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-4">
      {sources.map((source) => {
        const Icon = getIcon(source.type);

        return (
          <article
            key={source.id}
            className="rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/15"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                <Icon className="size-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {source.title}
                    </h3>

                    {source.sourceUrl ? (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {source.sourceUrl}
                      </p>
                    ) : null}
                  </div>

                  <KnowledgeStatusBadge status={source.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border bg-muted/20 px-2.5 py-1">
                    {getTypeLabel(source.type)}
                  </span>

                  <span className="rounded-full border bg-muted/20 px-2.5 py-1">
                    {source._count.chunks} chunks
                  </span>

                  <span className="rounded-full border bg-muted/20 px-2.5 py-1">
                    Updated {dateFormatter.format(source.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
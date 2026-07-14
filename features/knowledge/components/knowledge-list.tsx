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

type KnowledgeListProps = {
  sources: KnowledgeSource[];
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

export function KnowledgeList({
  sources,
}: KnowledgeListProps) {
  return (
    <div className="space-y-4">
      {sources.map((source) => {
        const Icon = getIcon(source.type);

        return (
          <article
            key={source.id}
            className="rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/15"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
                <Icon className="size-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">
                  {source.title}
                </h3>

                {source.sourceUrl ? (
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {source.sourceUrl}
                  </p>
                ) : null}

                <div className="mt-3">
                 <KnowledgeStatusBadge status={source.status} />
               </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
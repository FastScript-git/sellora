import {
  BookOpen,
  FileText,
  Globe,
  HelpCircle,
  NotebookPen,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { KnowledgeStatusBadge } from "@/features/knowledge/components/knowledge-status-badge";
import type {
  KnowledgeSource,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";

type KnowledgeSourceWithCount = KnowledgeSource & {
  _count: {
    chunks: number;
  };
};

type KnowledgeListProps = {
  sources: KnowledgeSourceWithCount[];
  employeeId: string;
  locale: string;
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

function getTypeTranslationKey(type: KnowledgeSourceType) {
  switch (type) {
    case "WEBSITE":
      return "website";

    case "PDF":
      return "pdf";

    case "FAQ":
      return "faq";

    case "NOTE":
      return "note";

    default:
      return "knowledge";
  }
}

export async function KnowledgeList({
  sources,
  employeeId,
  locale,
}: KnowledgeListProps) {
  const t = await getTranslations("knowledge.list");

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-4">
      {sources.map((source) => {
        const Icon = getIcon(source.type);
        const typeKey = getTypeTranslationKey(source.type);

        return (
          <Link
            key={source.id}
            href={`/${locale}/dashboard/employees/${employeeId}/knowledge/${source.id}`}
            className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <article className="rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/15 hover:bg-accent/20">
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

                    <KnowledgeStatusBadge
                      status={source.status}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border bg-muted/20 px-2.5 py-1">
                      {t(`types.${typeKey}`)}
                    </span>

                    <span className="rounded-full border bg-muted/20 px-2.5 py-1">
                      {t("chunks", {
                        count: source._count.chunks,
                      })}
                    </span>

                    <span className="rounded-full border bg-muted/20 px-2.5 py-1">
                      {t("updated", {
                        date: dateFormatter.format(source.updatedAt),
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
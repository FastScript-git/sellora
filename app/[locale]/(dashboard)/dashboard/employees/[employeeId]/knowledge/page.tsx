import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  NotebookPen,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { KnowledgeEmptyState } from "@/features/knowledge/components/knowledge-empty-state";
import { KnowledgeList } from "@/features/knowledge/components/knowledge-list";
import { KnowledgeSearchPreview } from "@/features/knowledge/components/knowledge-search-preview";
import { getKnowledgeSources } from "@/features/knowledge/queries";
import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type KnowledgePageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function KnowledgePage({
  params,
}: KnowledgePageProps) {
  const { locale, employeeId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace:
          "aiEmployeeKnowledge.page",
      }),
    ]);

  const hasAccess =
    await aiEmployeeBelongsToWorkspace({
      employeeId,
      workspaceId: workspace.id,
    });

  if (!hasAccess) {
    notFound();
  }

  const sources =
    await getKnowledgeSources({
      employeeId,
    });

  const totalChunks = sources.reduce(
    (total, source) =>
      total + source._count.chunks,
    0,
  );

  const indexedSources = sources.filter(
    (source) =>
      source.status === "INDEXED",
  ).length;

  const processingSources =
    sources.filter(
      (source) =>
        source.status === "PENDING" ||
        source.status === "INDEXING",
    ).length;

  const failedSources = sources.filter(
    (source) =>
      source.status === "FAILED",
  ).length;

  const websiteSources =
    sources.filter(
      (source) =>
        source.type === "WEBSITE",
    ).length;

  const pdfSources = sources.filter(
    (source) => source.type === "PDF",
  ).length;

  const noteSources = sources.filter(
    (source) => source.type === "NOTE",
  ).length;

  const overviewMetrics = [
    {
      key: "sources",
      label: t("totalSources"),
      value: sources.length,
      icon: BookOpen,
    },
    {
      key: "indexed",
      label: t("indexed"),
      value: indexedSources,
      icon: CheckCircle2,
    },
    {
      key: "processing",
      label: t("processing"),
      value: processingSources,
      icon: Clock3,
    },
    {
      key: "failed",
      label: t("failed"),
      value: failedSources,
      icon: TriangleAlert,
    },
    {
      key: "chunks",
      label: t("chunks"),
      value: totalChunks,
      icon: FileText,
    },
  ];

  const typeMetrics = [
    {
      key: "websites",
      label: t("websites"),
      value: websiteSources,
      icon: Globe2,
    },
    {
      key: "pdfs",
      label: t("pdfs"),
      value: pdfSources,
      icon: FileText,
    },
    {
      key: "notes",
      label: t("notes"),
      value: noteSources,
      icon: NotebookPen,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        compact
        icon={BookOpen}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {t("security")}
          </PageHeaderNote>
        }
        actions={
          sources.length > 0 ? (
            <KnowledgeEmptyState
              employeeId={employeeId}
              locale={locale}
              compact
            />
          ) : undefined
        }
      />

      {sources.length > 0 ? (
        <>
          <section
            aria-label={t("overview")}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <div className="grid sm:grid-cols-2 xl:grid-cols-5">
              {overviewMetrics.map(
                (metric, index) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.key}
                      className={[
                        "flex min-h-24 items-center gap-3 px-4 py-4",
                        index > 0
                          ? "border-t sm:border-l sm:border-t-0"
                          : "",
                        index === 2
                          ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0"
                          : "",
                        index === 4
                          ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0"
                          : "",
                      ].join(" ")}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          {metric.label}
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                          {metric.value}
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {typeMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <Card key={metric.key}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>

                      <p className="truncate text-sm text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>

                    <span className="text-xl font-semibold tabular-nums">
                      {metric.value}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <KnowledgeSearchPreview
            employeeId={employeeId}
            locale={locale}
          />

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {t("sourcesTitle")}
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("sourcesDescription")}
              </p>
            </div>

            <KnowledgeList
              sources={sources}
              employeeId={employeeId}
              locale={locale}
            />
          </section>
        </>
      ) : (
        <KnowledgeEmptyState
          employeeId={employeeId}
          locale={locale}
        />
      )}
    </div>
  );
}

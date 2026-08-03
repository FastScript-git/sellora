import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  FileText,
  Globe2,
  Hash,
  Layers3,
  NotebookPen,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KnowledgeSourceActions } from "@/features/knowledge/components/knowledge-source-actions";
import { KnowledgeStatusBadge } from "@/features/knowledge/components/knowledge-status-badge";
import { ReindexKnowledgeSourceButton } from "@/features/knowledge/components/reindex-knowledge-source-button";
import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { getKnowledgeSourceById } from "@/features/knowledge/repositories/knowledge.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type PageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
    sourceId: string;
  }>;
};

const jobStatusClassNames = {
  PENDING:
    "border-amber-500/30 bg-amber-500/10 text-amber-500",
  PROCESSING:
    "border-blue-500/30 bg-blue-500/10 text-blue-500",
  COMPLETED:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  FAILED:
    "border-red-500/30 bg-red-500/10 text-red-500",
} as const;

export default async function KnowledgeSourcePage({
  params,
}: PageProps) {
  const { locale, employeeId, sourceId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace:
          "aiEmployeeKnowledge",
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

  const source =
    await getKnowledgeSourceById(sourceId);

  if (
    !source ||
    source.employeeId !== employeeId
  ) {
    notFound();
  }

  const dateFormatter =
    new Intl.DateTimeFormat(
      locale === "uk" ? "uk-UA" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

  const totalTokens = source.chunks.reduce(
    (total, chunk) =>
      total + (chunk.tokenCount ?? 0),
    0,
  );

  const SourceIcon =
    source.type === "WEBSITE"
      ? Globe2
      : source.type === "NOTE"
        ? NotebookPen
        : FileText;

  const formatFileSize = (
    bytes: number | null,
  ) => {
    if (
      bytes === null ||
      bytes === undefined
    ) {
      return "—";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const calculateDuration = (
    startedAt: Date | null,
    finishedAt: Date | null,
  ) => {
    if (!startedAt || !finishedAt) {
      return "—";
    }

    const milliseconds =
      finishedAt.getTime() -
      startedAt.getTime();

    if (milliseconds < 1000) {
      return `${milliseconds} ms`;
    }

    return `${(
      milliseconds / 1000
    ).toFixed(1)} s`;
  };

  const overviewMetrics = [
    {
      key: "type",
      label: t("source.sourceType"),
      value: t(`source.types.${source.type}`),
      icon: SourceIcon,
    },
    {
      key: "chunks",
      label: t("source.chunks"),
      value: source._count.chunks,
      icon: Layers3,
    },
    {
      key: "tokens",
      label: t("source.tokens"),
      value: totalTokens,
      icon: Hash,
    },
    {
      key: "jobs",
      label: t("source.jobs"),
      value: source._count.indexJobs,
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <Link
            href={`/${locale}/dashboard/employees/${employeeId}/knowledge`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("source.back")}
          </Link>

          <div className="mt-5 flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <SourceIcon className="size-5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-tight">
                  {source.title}
                </h1>

                <KnowledgeStatusBadge
                  status={source.status}
                />
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {t(`source.types.${source.type}`)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <ReindexKnowledgeSourceButton
            sourceId={source.id}
            employeeId={employeeId}
            locale={locale}
          />

          <KnowledgeSourceActions
            sourceId={source.id}
            employeeId={employeeId}
            locale={locale}
            currentTitle={source.title}
          />
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
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
                  ].join(" ")}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {metric.label}
                    </p>

                    <p className="mt-1 truncate text-xl font-semibold tabular-nums">
                      {metric.value}
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("source.chunksSection.title")}
              </CardTitle>

              <CardDescription>
                {t("source.chunksSection.description")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {source.chunks.length === 0 ? (
                <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("source.chunksSection.empty")}
                  </p>
                </div>
              ) : (
                <div className="divide-y rounded-xl border">
                  {source.chunks.map(
                    (chunk) => (
                      <article
                        key={chunk.id}
                        className="px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {t("source.chunksSection.chunk")} #
                              {chunk.chunkIndex + 1}
                            </Badge>

                            <span className="text-xs text-muted-foreground">
                              {chunk.tokenCount !== null
                                ? t("source.chunksSection.tokenCount", {
                                    count:
                                      chunk.tokenCount,
                                  })
                                : t("source.chunksSection.noTokens")}
                            </span>
                          </div>

                          <time className="text-[11px] text-muted-foreground">
                            {dateFormatter.format(
                              chunk.createdAt,
                            )}
                          </time>
                        </div>

                        <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-7">
                          {chunk.content}
                        </pre>
                      </article>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("source.jobsSection.title")}
              </CardTitle>

              <CardDescription>
                {t("source.jobsSection.description")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {source.indexJobs.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("source.jobsSection.empty")}
                  </p>
                </div>
              ) : (
                <div className="divide-y rounded-xl border">
                  {source.indexJobs.map(
                    (job) => (
                      <article
                        key={job.id}
                        className="px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Badge
                            variant="outline"
                            className={
                              jobStatusClassNames[
                                job.status
                              ]
                            }
                          >
                            {t(
                              `jobs.${job.status.toLowerCase()}`,
                            )}
                          </Badge>

                          <span className="text-xs text-muted-foreground">
                            {t("source.jobsSection.attempts")}:{" "}
                            {job.attempts}
                          </span>
                        </div>

                        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                          <MetadataItem
                            label={t("source.jobsSection.started")}
                            value={
                              job.startedAt
                                ? dateFormatter.format(
                                    job.startedAt,
                                  )
                                : "—"
                            }
                          />

                          <MetadataItem
                            label={t("source.jobsSection.finished")}
                            value={
                              job.finishedAt
                                ? dateFormatter.format(
                                    job.finishedAt,
                                  )
                                : "—"
                            }
                          />

                          <MetadataItem
                            label={t("source.jobsSection.duration")}
                            value={calculateDuration(
                              job.startedAt,
                              job.finishedAt,
                            )}
                          />
                        </dl>

                        {job.error ? (
                          <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />

                            <div>
                              <p className="text-xs font-medium text-destructive">
                                {t("source.jobsSection.error")}
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-destructive">
                                {job.error}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("source.metadata.title")}
              </CardTitle>

              <CardDescription>
                {t("source.metadata.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <MetadataItem
                label={t("source.status")}
                value={source.status}
              />

              <MetadataItem
                label={t("source.sourceType")}
                value={
                  t(`source.types.${source.type}`)
                }
              />

              <MetadataItem
                label={t("source.metadata.fileName")}
                value={source.fileName ?? "—"}
              />

              <MetadataItem
                label={t("source.metadata.fileSize")}
                value={formatFileSize(
                  source.fileSizeBytes,
                )}
              />

              <MetadataItem
                label={t("source.metadata.mimeType")}
                value={source.mimeType ?? "—"}
              />

              <MetadataItem
                label={t("source.metadata.sourceUrl")}
                value={source.sourceUrl ?? "—"}
              />

              <MetadataItem
                label={t("source.metadata.created")}
                value={dateFormatter.format(
                  source.createdAt,
                )}
              />

              <MetadataItem
                label={t("source.updated")}
                value={dateFormatter.format(
                  source.updatedAt,
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("source.metadata.rawContent")}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {source.content?.trim() ? (
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border bg-muted/20 p-4 font-sans text-xs leading-6">
                  {source.content}
                </pre>
              ) : (
                <div className="rounded-xl border border-dashed px-4 py-8 text-center">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {t("source.metadata.noRawContent")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

type MetadataItemProps = {
  label: string;
  value: string | number;
};

function MetadataItem({
  label,
  value,
}: MetadataItemProps) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm font-medium">
        {value}
      </dd>
    </div>
  );
}

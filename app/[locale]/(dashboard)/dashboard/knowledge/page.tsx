import Link from "next/link";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileQuestion,
  FileText,
  Filter,
  Globe2,
  NotebookPen,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  getWorkspaceKnowledgeEmployees,
  getWorkspaceKnowledgeSources,
} from "@/features/knowledge/repositories/knowledge.repository";
import type {
  KnowledgeSourceStatus,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type WorkspaceKnowledgePageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    search?: string;
    employeeId?: string;
    type?: string;
    status?: string;
  }>;
};

const allowedTypes = new Set<
  KnowledgeSourceType
>([
  "WEBSITE",
  "PDF",
  "FAQ",
  "NOTE",
]);

const allowedStatuses = new Set<
  KnowledgeSourceStatus
>([
  "PENDING",
  "INDEXING",
  "INDEXED",
  "FAILED",
]);

function normalizeType(
  value: string | undefined,
): KnowledgeSourceType | undefined {
  if (
    value &&
    allowedTypes.has(
      value as KnowledgeSourceType,
    )
  ) {
    return value as KnowledgeSourceType;
  }

  return undefined;
}

function normalizeStatus(
  value: string | undefined,
): KnowledgeSourceStatus | undefined {
  if (
    value &&
    allowedStatuses.has(
      value as KnowledgeSourceStatus,
    )
  ) {
    return value as KnowledgeSourceStatus;
  }

  return undefined;
}

export default async function WorkspaceKnowledgePage({
  params,
  searchParams,
}: WorkspaceKnowledgePageProps) {
  const { locale } = await params;

  const filters = await searchParams;

  const workspace =
    await getCurrentWorkspace();

  const search =
    filters.search?.trim() ?? "";

  const employeeId =
    filters.employeeId?.trim() ?? "";

  const type = normalizeType(
    filters.type,
  );

  const status = normalizeStatus(
    filters.status,
  );

  const [sources, employees] =
    await Promise.all([
      getWorkspaceKnowledgeSources({
        workspaceId: workspace.id,
        search,
        employeeId:
          employeeId || undefined,
        type,
        status,
      }),

      getWorkspaceKnowledgeEmployees(
        workspace.id,
      ),
    ]);

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Workspace Knowledge",
        title: "База знань",
        description:
          "Керуйте всіма джерелами знань, підключеними до ШІ-співробітників робочого простору.",

        totalSources: "Усього джерел",
        indexed: "Проіндексовано",
        processing: "В обробці",
        failed: "З помилкою",
        totalChunks: "Усього chunks",

        filters: "Фільтри",
        search: "Пошук",
        searchPlaceholder:
          "Назва, файл, URL або ШІ-співробітник...",
        employee: "ШІ-співробітник",
        allEmployees:
          "Усі ШІ-співробітники",
        type: "Тип",
        allTypes: "Усі типи",
        status: "Статус",
        allStatuses: "Усі статуси",
        apply: "Застосувати",
        clear: "Очистити",

        sourcesTitle: "Джерела знань",
        resultCount: "Знайдено",
        noSourcesTitle:
          "Джерел не знайдено",
        noSourcesDescription:
          "Змініть фільтри або додайте джерело в базі знань потрібного ШІ-співробітника.",
        manageEmployee:
          "Відкрити базу знань",
        openSource: "Відкрити джерело",

        chunks: "chunks",
        jobs: "задач індексації",
        updated: "Оновлено",

        typeLabels: {
          WEBSITE: "Вебсайт",
          PDF: "PDF",
          FAQ: "FAQ",
          NOTE: "Нотатка",
        },

        statusLabels: {
          PENDING: "Очікує",
          INDEXING: "Індексація",
          INDEXED: "Готово",
          FAILED: "Помилка",
        },
      }
    : {
        eyebrow: "Workspace Knowledge",
        title: "Knowledge Base",
        description:
          "Manage all knowledge sources connected to AI Employees in this workspace.",

        totalSources: "Total sources",
        indexed: "Indexed",
        processing: "Processing",
        failed: "Failed",
        totalChunks: "Total chunks",

        filters: "Filters",
        search: "Search",
        searchPlaceholder:
          "Title, file, URL or AI Employee...",
        employee: "AI Employee",
        allEmployees: "All AI Employees",
        type: "Type",
        allTypes: "All types",
        status: "Status",
        allStatuses: "All statuses",
        apply: "Apply",
        clear: "Clear",

        sourcesTitle: "Knowledge sources",
        resultCount: "Found",
        noSourcesTitle:
          "No sources found",
        noSourcesDescription:
          "Change the filters or add a source from an AI Employee knowledge page.",
        manageEmployee:
          "Open knowledge base",
        openSource: "Open source",

        chunks: "chunks",
        jobs: "indexing jobs",
        updated: "Updated",

        typeLabels: {
          WEBSITE: "Website",
          PDF: "PDF",
          FAQ: "FAQ",
          NOTE: "Note",
        },

        statusLabels: {
          PENDING: "Pending",
          INDEXING: "Indexing",
          INDEXED: "Indexed",
          FAILED: "Failed",
        },
      };

  const totalChunks = sources.reduce(
    (total, source) =>
      total + source._count.chunks,
    0,
  );

  const indexedSources =
    sources.filter(
      (source) =>
        source.status === "INDEXED",
    ).length;

  const processingSources =
    sources.filter(
      (source) =>
        source.status === "PENDING" ||
        source.status === "INDEXING",
    ).length;

  const failedSources =
    sources.filter(
      (source) =>
        source.status === "FAILED",
    ).length;

  const metrics = [
    {
      key: "total",
      label: copy.totalSources,
      value: sources.length,
      icon: BookOpen,
    },
    {
      key: "indexed",
      label: copy.indexed,
      value: indexedSources,
      icon: CheckCircle2,
    },
    {
      key: "processing",
      label: copy.processing,
      value: processingSources,
      icon: Clock3,
    },
    {
      key: "failed",
      label: copy.failed,
      value: failedSources,
      icon: TriangleAlert,
    },
    {
      key: "chunks",
      label: copy.totalChunks,
      value: totalChunks,
      icon: FileText,
    },
  ];

  const dateFormatter =
    new Intl.DateTimeFormat(
      isUkrainian
        ? "uk-UA"
        : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

  const hasActiveFilters = Boolean(
    search ||
      employeeId ||
      type ||
      status,
  );

  return (
    <div className="min-w-0 space-y-6">
      <header className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {copy.eyebrow}
        </p>

        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </header>

      <section
        aria-label={copy.title}
        className="overflow-hidden rounded-xl border bg-card"
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map(
            (metric, index) => {
              const Icon =
                metric.icon;

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

      <Card className="min-w-0">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">
              {copy.filters}
            </h2>
          </div>

          <form
            method="get"
            className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_160px_160px_auto]"
          >
            <label className="min-w-0 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {copy.search}
              </span>

              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  placeholder={
                    copy.searchPlaceholder
                  }
                  className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </span>
            </label>

            <label className="min-w-0 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {copy.employee}
              </span>

              <select
                name="employeeId"
                defaultValue={employeeId}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">
                  {copy.allEmployees}
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name} (
                      {
                        employee._count
                          .knowledgeSources
                      }
                      )
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {copy.type}
              </span>

              <select
                name="type"
                defaultValue={type ?? ""}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">
                  {copy.allTypes}
                </option>

                {Array.from(
                  allowedTypes,
                ).map(
                  (sourceType) => (
                    <option
                      key={sourceType}
                      value={sourceType}
                    >
                      {
                        copy.typeLabels[
                          sourceType
                        ]
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {copy.status}
              </span>

              <select
                name="status"
                defaultValue={
                  status ?? ""
                }
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">
                  {
                    copy.allStatuses
                  }
                </option>

                {Array.from(
                  allowedStatuses,
                ).map(
                  (sourceStatus) => (
                    <option
                      key={
                        sourceStatus
                      }
                      value={
                        sourceStatus
                      }
                    >
                      {
                        copy
                          .statusLabels[
                          sourceStatus
                        ]
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
              <button
                type="submit"
                className={cn(
                  buttonVariants(),
                  "w-full cursor-pointer xl:w-auto",
                )}
              >
                <Filter className="size-4" />
                {copy.apply}
              </button>

              {hasActiveFilters ? (
                <Link
                  href={`/${locale}/dashboard/knowledge`}
                  aria-label={copy.clear}
                  title={copy.clear}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "icon",
                    }),
                    "shrink-0",
                  )}
                >
                  <X className="size-4" />
                </Link>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {copy.sourcesTitle}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {copy.resultCount}:{" "}
              {sources.length}
            </p>
          </div>
        </div>

        {sources.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-80 flex-col items-center justify-center px-4 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
                <FileQuestion className="size-5 text-muted-foreground" />
              </span>

              <h3 className="mt-5 text-lg font-semibold">
                {copy.noSourcesTitle}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {
                  copy.noSourcesDescription
                }
              </p>

              {employees[0] ? (
                <Link
                  href={`/${locale}/dashboard/employees/${employees[0].id}/knowledge`}
                  className={cn(
                    buttonVariants(),
                    "mt-6",
                  )}
                >
                  {copy.manageEmployee}

                  <ExternalLink className="size-4" />
                </Link>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="grid min-w-0 gap-3">
            {sources.map(
              (source) => {
                const sourceHref =
                  `/${locale}/dashboard/employees/${source.employeeId}` +
                  `/knowledge/${source.id}`;

                const employeeHref =
                  `/${locale}/dashboard/employees/${source.employeeId}` +
                  "/knowledge";

                const TypeIcon =
                  source.type ===
                  "WEBSITE"
                    ? Globe2
                    : source.type ===
                        "NOTE"
                      ? NotebookPen
                      : FileText;

                return (
                  <Card
                    key={source.id}
                    className="min-w-0 transition-colors hover:border-foreground/20"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                            <TypeIcon className="size-4 text-muted-foreground" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <Link
                                href={
                                  sourceHref
                                }
                                className="break-words font-medium transition-colors hover:text-primary"
                              >
                                {
                                  source.title
                                }
                              </Link>

                              <SourceStatusBadge
                                status={
                                  source.status
                                }
                                label={
                                  copy
                                    .statusLabels[
                                    source
                                      .status
                                  ]
                                }
                              />
                            </div>

                            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <TypeIcon className="size-3.5" />

                                {
                                  copy
                                    .typeLabels[
                                    source.type
                                  ]
                                }
                              </span>

                              <Link
                                href={
                                  employeeHref
                                }
                                className="inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-foreground"
                              >
                                <Bot className="size-3.5 shrink-0" />

                                <span className="break-words">
                                  {
                                    source
                                      .employee
                                      .name
                                  }
                                </span>
                              </Link>
                            </div>

                            {source.sourceUrl ||
                            source.fileName ? (
                              <p className="mt-2 max-w-3xl truncate text-xs text-muted-foreground">
                                {source.sourceUrl ??
                                  source.fileName}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
                          <div className="grid grid-cols-2 gap-2 sm:flex">
                            <MetadataBadge
                              value={
                                source._count
                                  .chunks
                              }
                              label={
                                copy.chunks
                              }
                            />

                            <MetadataBadge
                              value={
                                source._count
                                  .indexJobs
                              }
                              label={
                                copy.jobs
                              }
                            />
                          </div>

                          <div className="text-xs text-muted-foreground sm:text-right">
                            <p>
                              {copy.updated}
                            </p>

                            <time
                              dateTime={source.updatedAt.toISOString()}
                              className="mt-1 block whitespace-nowrap"
                            >
                              {dateFormatter.format(
                                source.updatedAt,
                              )}
                            </time>
                          </div>

                          <Link
                            href={
                              sourceHref
                            }
                            aria-label={
                              copy.openSource
                            }
                            title={
                              copy.openSource
                            }
                            className={cn(
                              buttonVariants({
                                variant:
                                  "outline",
                                size: "icon",
                              }),
                              "w-full shrink-0 sm:w-9",
                            )}
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

type SourceStatusBadgeProps = {
  status: KnowledgeSourceStatus;
  label: string;
};

function SourceStatusBadge({
  status,
  label,
}: SourceStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0",
        status === "INDEXED" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
        status === "FAILED" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        (status === "PENDING" ||
          status === "INDEXING") &&
          "border-amber-500/30 bg-amber-500/10 text-amber-500",
      )}
    >
      {label}
    </Badge>
  );
}

type MetadataBadgeProps = {
  value: number;
  label: string;
};

function MetadataBadge({
  value,
  label,
}: MetadataBadgeProps) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2 text-center">
      <p className="font-semibold tabular-nums">
        {value}
      </p>

      <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

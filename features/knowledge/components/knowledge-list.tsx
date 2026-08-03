"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  FileText,
  Globe,
  HelpCircle,
  NotebookPen,
  Search,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeStatusBadge } from "@/features/knowledge/components/knowledge-status-badge";
import type {
  KnowledgeSource,
  KnowledgeSourceType,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

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

type SourceFilter =
  | "ALL"
  | KnowledgeSourceType;

type SortOption =
  | "newest"
  | "oldest"
  | "most-chunks"
  | "least-chunks"
  | "name";

const sourceFilters: Array<{
  key: SourceFilter;
  icon: typeof BookOpen;
}> = [
  {
    key: "ALL",
    icon: BookOpen,
  },
  {
    key: "WEBSITE",
    icon: Globe,
  },
  {
    key: "PDF",
    icon: FileText,
  },
  {
    key: "FAQ",
    icon: HelpCircle,
  },
  {
    key: "NOTE",
    icon: NotebookPen,
  },
];

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
  employeeId,
  locale,
}: KnowledgeListProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        searchPlaceholder:
          "Пошук за назвою або URL...",
        results: "результатів",
        result: "результат",
        sortLabel: "Сортування",
        updated: "Оновлено",
        chunks: "chunks",
        open: "Відкрити",
        clear: "Очистити",
        noResultsTitle:
          "Джерела не знайдено",
        noResultsDescription:
          "Спробуйте змінити пошуковий запит або фільтр.",
        filters: {
          ALL: "Усі",
          WEBSITE: "Website",
          PDF: "PDF",
          FAQ: "FAQ",
          NOTE: "Нотатки",
        },
        sorts: {
          newest: "Спочатку нові",
          oldest: "Спочатку старі",
          mostChunks: "Найбільше chunks",
          leastChunks: "Найменше chunks",
          name: "За назвою",
        },
      }
    : {
        searchPlaceholder:
          "Search by title or URL...",
        results: "results",
        result: "result",
        sortLabel: "Sort",
        updated: "Updated",
        chunks: "chunks",
        open: "Open",
        clear: "Clear",
        noResultsTitle:
          "No knowledge sources found",
        noResultsDescription:
          "Try changing the search query or selected filter.",
        filters: {
          ALL: "All",
          WEBSITE: "Website",
          PDF: "PDF",
          FAQ: "FAQ",
          NOTE: "Notes",
        },
        sorts: {
          newest: "Newest first",
          oldest: "Oldest first",
          mostChunks: "Most chunks",
          leastChunks: "Fewest chunks",
          name: "Name",
        },
      };

  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<SourceFilter>("ALL");
  const [sort, setSort] =
    useState<SortOption>("newest");

  const dateFormatter =
    new Intl.DateTimeFormat(
      isUkrainian ? "uk-UA" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

  const filteredSources = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    const result = sources.filter(
      (source) => {
        const matchesFilter =
          filter === "ALL" ||
          source.type === filter;

        if (!matchesFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const searchableText = [
          source.title,
          source.sourceUrl,
          source.fileName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedQuery,
        );
      },
    );

    return [...result].sort(
      (first, second) => {
        switch (sort) {
          case "oldest":
            return (
              first.updatedAt.getTime() -
              second.updatedAt.getTime()
            );

          case "most-chunks":
            return (
              second._count.chunks -
              first._count.chunks
            );

          case "least-chunks":
            return (
              first._count.chunks -
              second._count.chunks
            );

          case "name":
            return first.title.localeCompare(
              second.title,
              isUkrainian
                ? "uk"
                : "en",
            );

          case "newest":
          default:
            return (
              second.updatedAt.getTime() -
              first.updatedAt.getTime()
            );
        }
      },
    );
  }, [
    filter,
    isUkrainian,
    query,
    sort,
    sources,
  ]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    filter !== "ALL" ||
    sort !== "newest";

  function resetFilters() {
    setQuery("");
    setFilter("ALL");
    setSort("newest");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border bg-card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1 xl:max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder={
                copy.searchPlaceholder
              }
              className="pl-9 pr-9"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={copy.clear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2">
              <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" />

              <span className="sr-only">
                {copy.sortLabel}
              </span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortOption,
                  )
                }
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="newest">
                  {copy.sorts.newest}
                </option>

                <option value="oldest">
                  {copy.sorts.oldest}
                </option>

                <option value="most-chunks">
                  {copy.sorts.mostChunks}
                </option>

                <option value="least-chunks">
                  {copy.sorts.leastChunks}
                </option>

                <option value="name">
                  {copy.sorts.name}
                </option>
              </select>
            </label>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                <X className="size-4" />
                {copy.clear}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {sourceFilters.map((item) => {
            const Icon = item.icon;
            const active =
              filter === item.key;

            const count =
              item.key === "ALL"
                ? sources.length
                : sources.filter(
                    (source) =>
                      source.type === item.key,
                  ).length;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setFilter(item.key)
                }
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />

                {copy.filters[item.key]}

                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-primary/15"
                      : "bg-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {filteredSources.length}{" "}
          {filteredSources.length === 1
            ? copy.result
            : copy.results}
        </p>
      </div>

      {filteredSources.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
            <Search className="size-5 text-muted-foreground" />
          </span>

          <h3 className="mt-4 font-semibold">
            {copy.noResultsTitle}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {copy.noResultsDescription}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-4"
          >
            <X className="size-4" />
            {copy.clear}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSources.map((source) => {
            const Icon = getIcon(
              source.type,
            );

            return (
              <Link
                key={source.id}
                href={`/${locale}/dashboard/employees/${employeeId}/knowledge/${source.id}`}
                className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <article className="rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-accent/20">
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                      <Icon className="size-5 text-muted-foreground" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-semibold">
                              {source.title}
                            </h3>

                            <span className="rounded-full border bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {
                                copy.filters[
                                  source.type
                                ]
                              }
                            </span>
                          </div>

                          {source.sourceUrl ? (
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {source.sourceUrl}
                            </p>
                          ) : source.fileName ? (
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {source.fileName}
                            </p>
                          ) : null}
                        </div>

                        <KnowledgeStatusBadge
                          status={source.status}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>
                          {source._count.chunks}{" "}
                          {copy.chunks}
                        </span>

                        <span
                          aria-hidden="true"
                          className="size-1 rounded-full bg-muted-foreground/50"
                        />

                        <span>
                          {copy.updated}{" "}
                          {dateFormatter.format(
                            source.updatedAt,
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:inline-flex">
                      {copy.open}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

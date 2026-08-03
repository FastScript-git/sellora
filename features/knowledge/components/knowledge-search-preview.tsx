"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileSearch,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type FormEvent,
  useState,
  useTransition,
} from "react";

import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchKnowledgePreviewAction,
  type SearchKnowledgePreviewResult,
} from "@/features/knowledge/actions/search-knowledge-preview";
import type { KnowledgeSearchResult } from "@/features/knowledge/services/search-knowledge";
import { cn } from "@/lib/utils";

type KnowledgeSearchPreviewProps = {
  employeeId: string;
  locale: string;
};

export function KnowledgeSearchPreview({
  employeeId,
  locale,
}: KnowledgeSearchPreviewProps) {
  const t = useTranslations(
    "aiEmployeeKnowledge.searchPreview",
  );

  const [query, setQuery] =
    useState("");

  const [result, setResult] =
    useState<SearchKnowledgePreviewResult | null>(
      null,
    );

  const [isPending, startTransition] =
    useTransition();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedQuery =
      query.trim();

    if (
      normalizedQuery.length < 2 ||
      isPending
    ) {
      return;
    }

    startTransition(async () => {
      const nextResult =
        await searchKnowledgePreviewAction({
          employeeId,
          query: normalizedQuery,
          limit: 8,
        });

      setResult(nextResult);
    });
  }

  function clearSearch() {
    if (isPending) {
      return;
    }

    setQuery("");
    setResult(null);
  }

  const results =
    result?.success === true
      ? result.results
      : [];

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Sparkles className="size-4 text-primary" />
          </span>

          <div className="min-w-0">
            <h2 className="font-semibold">
              {t("title")}
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder={t(
                "placeholder",
              )}
              maxLength={500}
              disabled={isPending}
              className="pl-9 pr-9"
            />

            {query.length > 0 ? (
              <button
                type="button"
                onClick={clearSearch}
                disabled={isPending}
                aria-label={t("clear")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={
              query.trim().length < 2 ||
              isPending
            }
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("searching")}
              </>
            ) : (
              <>
                <Search className="size-4" />
                {t("search")}
              </>
            )}
          </Button>
        </form>

        {result?.success === false ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {result.error}
          </div>
        ) : null}

        {!result ? (
          <EmptyState
            icon={FileSearch}
            title={t("emptyTitle")}
            description={t(
              "emptyDescription",
            )}
            compact
            className="mt-5"
          />
        ) : null}

        {result?.success === true &&
        results.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t(
              "noResultsTitle",
            )}
            description={t(
              "noResultsDescription",
            )}
            compact
            className="mt-5"
          />
        ) : null}

        {result?.success === true &&
        results.length > 0 ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  {t("results")}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t("resultCount", {
                    count: results.length,
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5 shrink-0" />

                <span>
                  {t("duration")}:
                </span>

                <span className="font-medium tabular-nums text-foreground">
                  {result.durationMs}{" "}
                  {t("milliseconds")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {results.map(
                (
                  searchResult,
                  index,
                ) => (
                  <SearchResultCard
                    key={searchResult.id}
                    result={searchResult}
                    index={index}
                    employeeId={employeeId}
                    locale={locale}
                  />
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type SearchResultCardProps = {
  result: KnowledgeSearchResult;
  index: number;
  employeeId: string;
  locale: string;
};

function SearchResultCard({
  result,
  index,
  employeeId,
  locale,
}: SearchResultCardProps) {
  const t = useTranslations(
    "aiEmployeeKnowledge.searchPreview",
  );

  const similarityPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        result.similarity * 100,
      ),
    ),
  );

  return (
    <article className="rounded-xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-xs font-semibold tabular-nums">
            {index + 1}
          </span>

          <div className="min-w-0">
            <p className="break-words text-sm font-medium sm:truncate">
              {result.sourceTitle}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {t("chunk")} #
                {result.chunkIndex + 1}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  similarityPercent >= 75
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : similarityPercent >= 50
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "text-muted-foreground",
                )}
              >
                {t("similarity")}:{" "}
                {similarityPercent}%
              </Badge>
            </div>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/employees/${employeeId}/knowledge/${result.knowledgeSourceId}`}
          className="inline-flex w-fit shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("openSource")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${similarityPercent}%`,
          }}
        />
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
        {result.content}
      </p>
    </article>
  );
}

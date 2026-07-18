"use client";

import { useActionState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  reindexKnowledgeSourceAction,
  type ReindexKnowledgeSourceState,
} from "@/features/knowledge/actions/reindex-knowledge-source";

type ReindexKnowledgeSourceButtonProps = {
  sourceId: string;
  employeeId: string;
  locale: string;
};

const initialState: ReindexKnowledgeSourceState = {
  success: false,
  message: null,
};

export function ReindexKnowledgeSourceButton({
  sourceId,
  employeeId,
  locale,
}: ReindexKnowledgeSourceButtonProps) {
  const [state, formAction, isPending] = useActionState(
    reindexKnowledgeSourceAction,
    initialState,
  );

  const isUkrainian = locale === "uk";

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <form action={formAction}>
        <input
          type="hidden"
          name="sourceId"
          value={sourceId}
        />

        <input
          type="hidden"
          name="employeeId"
          value={employeeId}
        />

        <input
          type="hidden"
          name="locale"
          value={locale}
        />

        <Button
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircle
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}

          {isPending
            ? isUkrainian
              ? "Запуск індексації..."
              : "Starting indexing..."
            : isUkrainian
              ? "Переіндексувати"
              : "Re-index"}
        </Button>
      </form>

      {state.message ? (
        <p
          className={
            state.success
              ? "text-sm text-emerald-600 dark:text-emerald-400"
              : "text-sm text-destructive"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
"use client";

import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

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
  const t = useTranslations(
    "aiEmployeeKnowledge.reindex",
  );

  const [state, formAction, isPending] =
    useActionState(
      reindexKnowledgeSourceAction,
      initialState,
    );

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
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
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <LoaderCircle
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RefreshCw
              className="size-4"
              aria-hidden="true"
            />
          )}

          {isPending
            ? t("pending")
            : t("idle")}
        </Button>
      </form>

      {state.message ? (
        <p
          role="status"
          className={
            state.success
              ? "max-w-sm text-sm text-emerald-600 dark:text-emerald-400"
              : "max-w-sm text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

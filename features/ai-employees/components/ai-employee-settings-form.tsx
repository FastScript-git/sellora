"use client";

import {
  Archive,
  Bot,
  CheckCircle2,
  Loader2,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { archiveAIEmployeeAction } from "@/features/ai-employees/actions/archive-ai-employee";
import { updateAIEmployeeSettingsAction } from "@/features/ai-employees/actions/update-ai-employee-settings";
import type { AIEmployeeStatus } from "@/lib/generated/prisma/client";

type SettingsValues = {
  name: string;
  role: string;
  description: string;
  status: AIEmployeeStatus;
};

type AIEmployeeSettingsFormProps = {
  employeeId: string;
  locale: string;
  initialValues: SettingsValues;
};

export function AIEmployeeSettingsForm({
  employeeId,
  locale,
  initialValues,
}: AIEmployeeSettingsFormProps) {
  const t = useTranslations(
    "aiEmployeeSettings",
  );

  const router = useRouter();

  const [values, setValues] =
    useState(initialValues);

  const [savedValues, setSavedValues] =
    useState(initialValues);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    isArchiving,
    startArchiveTransition,
  ] = useTransition();

  const isDirty =
    JSON.stringify(values) !==
    JSON.stringify(savedValues);

  function updateValue<
    Key extends keyof SettingsValues,
  >(
    key: Key,
    value: SettingsValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage(null);
    setError(null);
  }

  function saveSettings() {
    if (isPending || !isDirty) {
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result =
        await updateAIEmployeeSettingsAction({
          employeeId,
          locale,
          name: values.name,
          role: values.role,
          description:
            values.description,
          status: values.status,
        });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSavedValues(values);
      setMessage(result.message);

      router.refresh();
    });
  }

  function archiveEmployee() {
    if (isArchiving) {
      return;
    }

    const confirmed =
      window.confirm(
        t("danger.confirmation"),
      );

    if (!confirmed) {
      return;
    }

    setError(null);

    startArchiveTransition(
      async () => {
        const result =
          await archiveAIEmployeeAction({
            employeeId,
            locale,
          });

        if (!result.success) {
          setError(result.error);
          return;
        }

        router.push(
          result.redirectTo,
        );

        router.refresh();
      },
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="size-4 shrink-0" />

          {message}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border bg-card">
        <header className="border-b px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
              <Bot className="size-4 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <h2 className="font-semibold">
                {t("general.title")}
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t(
                  "general.description",
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employee-name">
              {t("general.name")}
            </Label>

            <Input
              id="employee-name"
              value={values.name}
              maxLength={80}
              disabled={isPending}
              placeholder={t(
                "general.namePlaceholder",
              )}
              onChange={(event) =>
                updateValue(
                  "name",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-role">
              {t("general.role")}
            </Label>

            <Input
              id="employee-role"
              value={values.role}
              maxLength={120}
              disabled={isPending}
              placeholder={t(
                "general.rolePlaceholder",
              )}
              onChange={(event) =>
                updateValue(
                  "role",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="employee-description">
              {t(
                "general.descriptionLabel",
              )}
            </Label>

            <Textarea
              id="employee-description"
              value={values.description}
              rows={5}
              maxLength={1000}
              disabled={isPending}
              placeholder={t(
                "general.descriptionPlaceholder",
              )}
              className="min-h-28 resize-y"
              onChange={(event) =>
                updateValue(
                  "description",
                  event.target.value,
                )
              }
            />

            <p className="text-right text-xs tabular-nums text-muted-foreground">
              {values.description.length}
              /1000
            </p>
          </div>

          <div className="space-y-2 lg:max-w-sm">
            <Label htmlFor="employee-status">
              {t("behavior.status")}
            </Label>

            <select
              id="employee-status"
              value={values.status}
              disabled={isPending}
              onChange={(event) =>
                updateValue(
                  "status",
                  event.target
                    .value as AIEmployeeStatus,
                )
              }
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="DRAFT">
                {t("statuses.draft")}
              </option>

              <option value="ACTIVE">
                {t("statuses.active")}
              </option>

              <option value="PAUSED">
                {t("statuses.paused")}
              </option>
            </select>
          </div>

          <div className="flex items-end lg:justify-end">
            <Button
              type="button"
              disabled={
                !isDirty ||
                isPending
              }
              onClick={saveSettings}
              className="w-full lg:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("actions.saving")}
                </>
              ) : message &&
                !isDirty ? (
                <>
                  <CheckCircle2 className="size-4" />
                  {t("actions.saved")}
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {t("actions.save")}
                </>
              )}
            </Button>
          </div>
        </div>

        {isDirty ? (
          <div className="border-t bg-amber-500/5 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400">
            {t("actions.unsaved")}
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5">
        <header className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
              <ShieldAlert className="size-4" />
            </span>

            <div className="min-w-0">
              <h2 className="font-semibold text-destructive">
                {t("danger.title")}
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t(
                  "danger.description",
                )}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            disabled={isArchiving}
            onClick={archiveEmployee}
            className="w-full shrink-0 sm:w-auto"
          >
            {isArchiving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t(
                  "danger.archiving",
                )}
              </>
            ) : (
              <>
                <Archive className="size-4" />
                {t(
                  "danger.archive",
                )}
              </>
            )}
          </Button>
        </header>
      </section>
    </div>
  );
}

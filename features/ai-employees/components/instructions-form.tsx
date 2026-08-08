"use client";

import {
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Ban,
  CheckCircle2,
  Languages,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Save,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateInstructionsAction,
  type UpdateInstructionsActionState,
} from "@/features/ai-employees/actions/update-instructions";
import type { AIEmployeeLanguage } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type InstructionsFormValues = {
  language: AIEmployeeLanguage;
  tone: string;
  identity: string;
  goals: string;
  rules: string;
  responseStyle: string;
  restrictions: string;
};

type InstructionTranslation = {
  title: string;
  description: string;
  label: string;
  placeholder: string;
  hint: string;
};

type InstructionsFormTranslations = {
  identity: InstructionTranslation;
  goals: InstructionTranslation;
  rules: InstructionTranslation;
  responseStyle: InstructionTranslation;
  restrictions: InstructionTranslation;
  save: string;
  saving: string;
  saved: string;
};

type InstructionsFormProps = {
  employeeId: string;
  locale: string;
  initialValues: InstructionsFormValues;
  translations: InstructionsFormTranslations;
};

type InstructionFieldProps = {
  id:
    | "identity"
    | "goals"
    | "rules"
    | "responseStyle"
    | "restrictions";
  icon: ReactNode;
  translation: InstructionTranslation;
  value: string;
  error?: string;
  rows: number;
  disabled: boolean;
  className?: string;
  onChange: (value: string) => void;
};

const MAX_FIELD_LENGTH = 4000;

const initialActionState: UpdateInstructionsActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

function areValuesEqual(
  first: InstructionsFormValues,
  second: InstructionsFormValues,
) {
  return (
    first.language === second.language &&
    first.tone === second.tone &&
    first.identity === second.identity &&
    first.goals === second.goals &&
    first.rules === second.rules &&
    first.responseStyle === second.responseStyle &&
    first.restrictions === second.restrictions
  );
}

export function InstructionsForm({
  employeeId,
  locale,
  initialValues,
  translations,
}: InstructionsFormProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        language: "Мова",
        languageDescription:
          "Основна мова, якою AI Employee спілкується з клієнтами.",
        tone: "Тон спілкування",
        toneDescription:
          "Визначте загальний стиль і характер відповідей.",
        tonePlaceholder:
          "Наприклад: професійний, дружній, лаконічний",
        english: "English",
        ukrainian: "Українська",
        unsaved: "Є незбережені зміни",
        unsavedDescription:
          "Збережіть налаштування перед переходом на іншу сторінку.",
        cancel: "Скасувати",
        configured: "заповнено",
      }
    : {
        language: "Language",
        languageDescription:
          "The primary language used by this AI Employee when communicating with customers.",
        tone: "Communication tone",
        toneDescription:
          "Define the overall style and character of responses.",
        tonePlaceholder:
          "For example: professional, friendly, concise",
        english: "English",
        ukrainian: "Ukrainian",
        unsaved: "You have unsaved changes",
        unsavedDescription:
          "Save the configuration before leaving this page.",
        cancel: "Cancel",
        configured: "configured",
      };

  const [values, setValues] =
    useState<InstructionsFormValues>(initialValues);

  const [savedValues, setSavedValues] =
    useState<InstructionsFormValues>(initialValues);

  const submittedValuesRef =
    useRef<InstructionsFormValues>(initialValues);

  const [state, formAction, isPending] = useActionState(
    updateInstructionsAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSavedValues(submittedValuesRef.current);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state.success]);

  const isDirty = useMemo(
    () => !areValuesEqual(values, savedValues),
    [values, savedValues],
  );

  const instructionValues = [
    values.identity,
    values.goals,
    values.rules,
    values.responseStyle,
    values.restrictions,
  ];

  const completedFields =
    instructionValues.filter(
      (value) => value.trim().length > 0,
    ).length;

  const fieldErrors = state.fieldErrors ?? {};

  function updateField<
    Key extends keyof InstructionsFormValues,
  >(
    field: Key,
    value: InstructionsFormValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function cancelChanges() {
    setValues(savedValues);
  }

  function handleSubmit() {
    submittedValuesRef.current = values;
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-card">
          <header className="border-b px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                <Languages className="size-4" />
              </span>

              <div>
                <h2 className="text-sm font-semibold">
                  {copy.language}
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {copy.languageDescription}
                </p>
              </div>
            </div>
          </header>

          <div className="p-4">
            <Label
              htmlFor="language"
              className="text-xs"
            >
              {copy.language}
            </Label>

            <select
              id="language"
              name="language"
              value={values.language}
              disabled={isPending}
              onChange={(event) =>
                updateField(
                  "language",
                  event.target
                    .value as AIEmployeeLanguage,
                )
              }
              className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="EN">
                {copy.english}
              </option>

              <option value="UK">
                {copy.ukrainian}
              </option>
            </select>

            {fieldErrors.language ? (
              <p className="mt-2 text-xs text-destructive">
                {fieldErrors.language}
              </p>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <header className="border-b px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                <MessageSquareText className="size-4" />
              </span>

              <div>
                <h2 className="text-sm font-semibold">
                  {copy.tone}
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {copy.toneDescription}
                </p>
              </div>
            </div>
          </header>

          <div className="p-4">
            <Label
              htmlFor="tone"
              className="text-xs"
            >
              {copy.tone}
            </Label>

            <Input
              id="tone"
              name="tone"
              value={values.tone}
              maxLength={80}
              disabled={isPending}
              placeholder={copy.tonePlaceholder}
              className="mt-2"
              onChange={(event) =>
                updateField(
                  "tone",
                  event.target.value,
                )
              }
            />

            {fieldErrors.tone ? (
              <p className="mt-2 text-xs text-destructive">
                {fieldErrors.tone}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {completedFields}/5{" "}
            {copy.configured}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {isDirty
              ? copy.unsavedDescription
              : translations.saved}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {isDirty ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelChanges}
              disabled={isPending}
            >
              <RotateCcw className="size-4" />
              {copy.cancel}
            </Button>
          ) : null}

          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {translations.saving}
              </>
            ) : state.success && !isDirty ? (
              <>
                <CheckCircle2 className="size-4" />
                {translations.saved}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {translations.save}
              </>
            )}
          </Button>
        </div>
      </section>

      {!state.success && state.message ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <InstructionField
          id="identity"
          icon={<UserRound className="size-4" />}
          translation={translations.identity}
          value={values.identity}
          error={fieldErrors.identity}
          rows={6}
          disabled={isPending}
          onChange={(value) =>
            updateField("identity", value)
          }
        />

        <InstructionField
          id="goals"
          icon={<Target className="size-4" />}
          translation={translations.goals}
          value={values.goals}
          error={fieldErrors.goals}
          rows={6}
          disabled={isPending}
          onChange={(value) =>
            updateField("goals", value)
          }
        />

        <InstructionField
          id="rules"
          icon={<ShieldCheck className="size-4" />}
          translation={translations.rules}
          value={values.rules}
          error={fieldErrors.rules}
          rows={7}
          disabled={isPending}
          onChange={(value) =>
            updateField("rules", value)
          }
        />

        <InstructionField
          id="responseStyle"
          icon={<MessageSquareText className="size-4" />}
          translation={translations.responseStyle}
          value={values.responseStyle}
          error={fieldErrors.responseStyle}
          rows={7}
          disabled={isPending}
          onChange={(value) =>
            updateField("responseStyle", value)
          }
        />

        <InstructionField
          id="restrictions"
          icon={<Ban className="size-4" />}
          translation={translations.restrictions}
          value={values.restrictions}
          error={fieldErrors.restrictions}
          rows={6}
          disabled={isPending}
          className="lg:col-span-2"
          onChange={(value) =>
            updateField("restrictions", value)
          }
        />
      </div>
    </form>
  );
}

function InstructionField({
  id,
  icon,
  translation,
  value,
  error,
  rows,
  disabled,
  className,
  onChange,
}: InstructionFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        className,
      )}
    >
      <header className="border-b px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
              {icon}
            </span>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold">
                {translation.title}
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {translation.description}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {value.length}/{MAX_FIELD_LENGTH}
          </span>
        </div>
      </header>

      <div className="space-y-2 p-4">
        <Label
          htmlFor={id}
          className="text-xs"
        >
          {translation.label}
        </Label>

        <Textarea
          id={id}
          name={id}
          value={value}
          rows={rows}
          maxLength={MAX_FIELD_LENGTH}
          placeholder={translation.placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : hintId
          }
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-h-36 resize-y text-sm leading-6 md:min-h-40"
        />

        {error ? (
          <p
            id={errorId}
            className="text-xs leading-5 text-destructive"
          >
            {error}
          </p>
        ) : (
          <p
            id={hintId}
            className="line-clamp-2 text-xs leading-5 text-muted-foreground"
          >
            {translation.hint}
          </p>
        )}
      </div>
    </section>
  );
}

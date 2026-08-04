"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Bot,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAIEmployeeAction,
  type CreateAIEmployeeActionState,
} from "@/features/ai-employees/actions";

type CreateAIEmployeeFormTranslations = {
  nameLabel: string;
  namePlaceholder: string;
  nameHint: string;
  roleLabel: string;
  rolePlaceholder: string;
  roleHint: string;
  cancel: string;
  createDraft: string;
  creating: string;
};

type CreateAIEmployeeFormProps = {
  locale: string;
  translations: CreateAIEmployeeFormTranslations;
};

const initialCreateAIEmployeeState: CreateAIEmployeeActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export function CreateAIEmployeeForm({
  locale,
  translations,
}: CreateAIEmployeeFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      createAIEmployeeAction,
      initialCreateAIEmployeeState,
    );

  const employeesHref =
    `/${locale}/dashboard/employees`;

  const fieldErrors =
    state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <input
        type="hidden"
        name="locale"
        value={locale}
      />

      <input
        type="hidden"
        name="description"
        value=""
      />

      <input
        type="hidden"
        name="language"
        value={locale === "uk" ? "UK" : "EN"}
      />

      <input
        type="hidden"
        name="tone"
        value="professional"
      />

      {state?.message ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">
            {translations.nameLabel}
          </Label>

          <div className="relative">
            <Bot
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              id="name"
              name="name"
              placeholder={
                translations.namePlaceholder
              }
              autoComplete="off"
              autoFocus
              aria-invalid={Boolean(
                fieldErrors.name,
              )}
              aria-describedby={
                fieldErrors.name
                  ? "name-error"
                  : "name-hint"
              }
              disabled={isPending}
              className="h-11 pl-10"
              required
            />
          </div>

          {fieldErrors.name ? (
            <p
              id="name-error"
              className="text-xs text-destructive"
            >
              {fieldErrors.name}
            </p>
          ) : (
            <p
              id="name-hint"
              className="text-xs leading-5 text-muted-foreground"
            >
              {translations.nameHint}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">
            {translations.roleLabel}
          </Label>

          <div className="relative">
            <Sparkles
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              id="role"
              name="role"
              placeholder={
                translations.rolePlaceholder
              }
              autoComplete="off"
              aria-invalid={Boolean(
                fieldErrors.role,
              )}
              aria-describedby={
                fieldErrors.role
                  ? "role-error"
                  : "role-hint"
              }
              disabled={isPending}
              className="h-11 pl-10"
              required
            />
          </div>

          {fieldErrors.role ? (
            <p
              id="role-error"
              className="text-xs text-destructive"
            >
              {fieldErrors.role}
            </p>
          ) : (
            <p
              id="role-hint"
              className="text-xs leading-5 text-muted-foreground"
            >
              {translations.roleHint}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href={employeesHref}
          aria-disabled={isPending}
          className="inline-flex h-10 w-full items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto"
        >
          {translations.cancel}
        </Link>

        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}

          {isPending
            ? translations.creating
            : translations.createDraft}
        </Button>
      </div>
    </form>
  );
}

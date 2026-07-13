"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAIEmployeeAction,
  type CreateAIEmployeeActionState,
} from "@/features/ai-employees/actions";

type CreateAIEmployeeFormTranslations = {
  basicInformationTitle: string;
  basicInformationDescription: string;
  communicationTitle: string;
  communicationDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  nameHint: string;
  roleLabel: string;
  rolePlaceholder: string;
  roleHint: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHint: string;
  languageLabel: string;
  english: string;
  ukrainian: string;
  toneLabel: string;
  professional: string;
  friendly: string;
  concise: string;
  empathetic: string;
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
  const [state, formAction, isPending] = useActionState(
    createAIEmployeeAction,
    initialCreateAIEmployeeState,
  );

  const employeesHref = `/${locale}/dashboard/employees`;
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      {state?.message ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{translations.basicInformationTitle}</CardTitle>

          <CardDescription>
            {translations.basicInformationDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">{translations.nameLabel}</Label>

            <Input
              id="name"
              name="name"
              placeholder={translations.namePlaceholder}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "name-error" : "name-hint"
              }
              disabled={isPending}
              required
            />

            {fieldErrors.name ? (
              <p id="name-error" className="text-xs text-destructive">
                {fieldErrors.name}
              </p>
            ) : (
              <p id="name-hint" className="text-xs text-muted-foreground">
                {translations.nameHint}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">{translations.roleLabel}</Label>

            <Input
              id="role"
              name="role"
              placeholder={translations.rolePlaceholder}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.role)}
              aria-describedby={
                fieldErrors.role ? "role-error" : "role-hint"
              }
              disabled={isPending}
              required
            />

            {fieldErrors.role ? (
              <p id="role-error" className="text-xs text-destructive">
                {fieldErrors.role}
              </p>
            ) : (
              <p id="role-hint" className="text-xs text-muted-foreground">
                {translations.roleHint}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">
              {translations.descriptionLabel}
            </Label>

            <Textarea
              id="description"
              name="description"
              placeholder={translations.descriptionPlaceholder}
              rows={5}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description
                  ? "description-error"
                  : "description-hint"
              }
              disabled={isPending}
            />

            {fieldErrors.description ? (
              <p id="description-error" className="text-xs text-destructive">
                {fieldErrors.description}
              </p>
            ) : (
              <p
                id="description-hint"
                className="text-xs text-muted-foreground"
              >
                {translations.descriptionHint}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{translations.communicationTitle}</CardTitle>

          <CardDescription>
            {translations.communicationDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="language">{translations.languageLabel}</Label>

            <select
              id="language"
              name="language"
              defaultValue={locale === "uk" ? "UK" : "EN"}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.language)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="EN">{translations.english}</option>
              <option value="UK">{translations.ukrainian}</option>
            </select>

            {fieldErrors.language ? (
              <p className="text-xs text-destructive">
                {fieldErrors.language}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tone">{translations.toneLabel}</Label>

            <select
              id="tone"
              name="tone"
              defaultValue="professional"
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.tone)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="professional">{translations.professional}</option>
              <option value="friendly">{translations.friendly}</option>
              <option value="concise">{translations.concise}</option>
              <option value="empathetic">{translations.empathetic}</option>
            </select>

            {fieldErrors.tone ? (
              <p className="text-xs text-destructive">
                {fieldErrors.tone}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={employeesHref}
          aria-disabled={isPending}
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          {translations.cancel}
        </Link>

        <Button type="submit" disabled={isPending}>
          <Save className="size-4" />
          {isPending ? translations.creating : translations.createDraft}
        </Button>
      </div>
    </form>
  );
}
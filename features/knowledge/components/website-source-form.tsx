"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteSourceAction,
  type CreateWebsiteSourceState,
} from "@/features/knowledge/actions/create-website-source";

type WebsiteSourceFormProps = {
  employeeId: string;
  locale: string;
};

const initialCreateWebsiteSourceState: CreateWebsiteSourceState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export function WebsiteSourceForm({
  employeeId,
  locale,
}: WebsiteSourceFormProps) {
  const [state, formAction, isPending] = useActionState(
    createWebsiteSourceAction,
    initialCreateWebsiteSourceState,
  );

  const fieldErrors = state?.fieldErrors ?? {};
  const message = state?.message ?? null;
  const isSuccess = state?.success ?? false;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="locale" value={locale} />

      {message ? (
        <div
          role={isSuccess ? "status" : "alert"}
          className={
            isSuccess
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
              : "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {message}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Website name</Label>

        <Input
          id="title"
          name="title"
          placeholder="Company website"
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={
            fieldErrors.title ? "title-error" : undefined
          }
          required
        />

        {fieldErrors.title ? (
          <p id="title-error" className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Website URL</Label>

        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          placeholder="https://example.com"
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.sourceUrl)}
          aria-describedby={
            fieldErrors.sourceUrl ? "source-url-error" : undefined
          }
          required
        />

        {fieldErrors.sourceUrl ? (
          <p id="source-url-error" className="text-xs text-destructive">
            {fieldErrors.sourceUrl}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Adding..." : "Add Website"}
      </Button>
    </form>
  );
}
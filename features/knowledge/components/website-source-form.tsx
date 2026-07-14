"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createWebsiteSourceAction,
  initialCreateWebsiteSourceState,
} from "@/features/knowledge/actions/create-website-source";

type WebsiteSourceFormProps = {
  employeeId: string;
  locale: string;
};

export function WebsiteSourceForm({
  employeeId,
  locale,
}: WebsiteSourceFormProps) {
  const [state, formAction, isPending] = useActionState(
    createWebsiteSourceAction,
    initialCreateWebsiteSourceState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="locale" value={locale} />

      {state.message ? (
        <div
          className={
            state.success
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
              : "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Website name</Label>

        <Input
          id="title"
          name="title"
          placeholder="Company website"
          disabled={isPending}
        />

        {state.fieldErrors.title ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Website URL</Label>

        <Input
          id="sourceUrl"
          name="sourceUrl"
          placeholder="https://example.com"
          disabled={isPending}
        />

        {state.fieldErrors.sourceUrl ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.sourceUrl}
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
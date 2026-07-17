"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  createNoteSourceAction,
  type CreateNoteSourceState,
} from "@/features/knowledge/actions/create-note-source";

type NoteSourceFormProps = {
  employeeId: string;
  locale: string;
};

const initialState: CreateNoteSourceState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export function NoteSourceForm({
  employeeId,
  locale,
}: NoteSourceFormProps) {
  const [state, formAction, isPending] = useActionState(
    createNoteSourceAction,
    initialState,
  );

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="locale" value={locale} />

      {state.message && (
        <div
          className={
            state.success
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
              : "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Note title</Label>

        <Input
          id="title"
          name="title"
          placeholder="Internal documentation"
          disabled={isPending}
        />

        {fieldErrors.title && (
          <p className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>

        <Textarea
          id="content"
          name="content"
          rows={12}
          placeholder="Write everything the AI Employee should know..."
          disabled={isPending}
        />

        {fieldErrors.content && (
          <p className="text-xs text-destructive">
            {fieldErrors.content}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Add Note"}
      </Button>
    </form>
  );
}
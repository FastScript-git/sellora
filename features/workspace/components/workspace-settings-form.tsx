"use client";

import {
  Loader2,
  Save,
} from "lucide-react";
import {
  useActionState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateWorkspaceSettingsAction,
  type UpdateWorkspaceSettingsState,
} from "@/features/workspace/actions/update-workspace-settings";

type WorkspaceSettingsFormProps = {
  locale: string;
  initialName: string;
  slug: string;

  translations: {
    nameLabel: string;
    nameDescription: string;
    slugLabel: string;
    slugDescription: string;
    save: string;
    saving: string;
  };
};

const initialState: UpdateWorkspaceSettingsState =
  {
    success: false,
    message: null,
    fieldErrors: {},
  };

export function WorkspaceSettingsForm({
  locale,
  initialName,
  slug,
  translations,
}: WorkspaceSettingsFormProps) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    updateWorkspaceSettingsAction,
    initialState,
  );

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

      {state.message ? (
        <div
          role="status"
          className={
            state.success
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500"
              : "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="workspace-name">
          {translations.nameLabel}
        </Label>

        <Input
          id="workspace-name"
          name="name"
          defaultValue={initialName}
          maxLength={80}
          disabled={isPending}
          aria-invalid={Boolean(
            state.fieldErrors.name,
          )}
          aria-describedby={
            state.fieldErrors.name
              ? "workspace-name-error"
              : "workspace-name-description"
          }
          required
        />

        {state.fieldErrors.name ? (
          <p
            id="workspace-name-error"
            className="text-xs text-destructive"
          >
            {state.fieldErrors.name}
          </p>
        ) : (
          <p
            id="workspace-name-description"
            className="text-xs leading-5 text-muted-foreground"
          >
            {translations.nameDescription}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-slug">
          {translations.slugLabel}
        </Label>

        <Input
          id="workspace-slug"
          value={slug}
          readOnly
          className="font-mono text-xs"
        />

        <p className="text-xs leading-5 text-muted-foreground">
          {translations.slugDescription}
        </p>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-36 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {isPending
            ? translations.saving
            : translations.save}
        </Button>
      </div>
    </form>
  );
}

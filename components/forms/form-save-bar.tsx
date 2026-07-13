"use client";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

type FormSaveBarProps = {
  dirty: boolean;
  pending: boolean;
  onCancel: () => void;
};

export function FormSaveBar({
  dirty,
  pending,
  onCancel,
}: FormSaveBarProps) {
  if (!dirty) {
    return null;
  }

  return (
    <div className="sticky bottom-6 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-xl border bg-background/95 px-5 py-4 shadow-2xl backdrop-blur">
        <div>
          <p className="font-medium">
            Unsaved changes
          </p>

          <p className="text-sm text-muted-foreground">
            Save your changes before leaving this page.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
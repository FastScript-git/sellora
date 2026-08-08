"use client";

import {
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateAIEmployeeDescriptionAction } from "@/features/ai-employees/actions/update-ai-employee-description";

type EmployeeDescriptionCardProps = {
  employeeId: string;
  locale: string;
  initialDescription: string;
};

export function EmployeeDescriptionCard({
  employeeId,
  locale,
  initialDescription,
}: EmployeeDescriptionCardProps) {
  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Опис",
        empty:
          "Опис цього AI Employee ще не додано.",
        edit: "Редагувати",
        save: "Зберегти",
        saving: "Збереження...",
        saved: "Збережено",
        cancel: "Скасувати",
        placeholder:
          "Коротко опишіть роль і призначення цього AI Employee.",
      }
    : {
        title: "Description",
        empty:
          "No description has been added for this AI Employee yet.",
        edit: "Edit",
        save: "Save",
        saving: "Saving...",
        saved: "Saved",
        cancel: "Cancel",
        placeholder:
          "Briefly describe the role and purpose of this AI Employee.",
      };

  const [
    description,
    setDescription,
  ] = useState(
    initialDescription,
  );

  const [
    savedDescription,
    setSavedDescription,
  ] = useState(
    initialDescription,
  );

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const isDirty =
    description !==
    savedDescription;

  function cancelEditing() {
    setDescription(
      savedDescription,
    );

    setMessage(null);
    setError(null);
    setIsEditing(false);
  }

  function saveDescription() {
    if (
      isPending ||
      !isDirty
    ) {
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(
      async () => {
        const result =
          await updateAIEmployeeDescriptionAction(
            {
              employeeId,
              locale,
              description,
            },
          );

        if (!result.success) {
          setError(
            result.error,
          );

          return;
        }

        setSavedDescription(
          description,
        );

        setMessage(
          result.message,
        );

        setIsEditing(false);
      },
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">
          {copy.title}
        </CardTitle>

        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMessage(null);
              setError(null);
              setIsEditing(true);
            }}
          >
            <Pencil className="size-3.5" />
            {copy.edit}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={description}
              rows={6}
              maxLength={1000}
              disabled={isPending}
              placeholder={
                copy.placeholder
              }
              className="min-h-36 resize-y text-sm leading-6"
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs tabular-nums text-muted-foreground">
                {
                  description.length
                }
                /1000
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    isPending
                  }
                  onClick={
                    cancelEditing
                  }
                >
                  <RotateCcw className="size-3.5" />
                  {copy.cancel}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={
                    isPending ||
                    !isDirty
                  }
                  onClick={
                    saveDescription
                  }
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}

                  {isPending
                    ? copy.saving
                    : copy.save}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-36 rounded-xl border bg-muted/10 p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {savedDescription ||
                copy.empty}
            </p>
          </div>
        )}

        {message ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            {message}
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-3 text-xs text-destructive"
          >
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

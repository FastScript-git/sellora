"use client";

import {
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteKnowledgeSourceAction } from "@/features/knowledge/actions/delete-knowledge-source";
import { renameKnowledgeSourceAction } from "@/features/knowledge/actions/rename-knowledge-source";

type KnowledgeSourceActionsProps = {
  sourceId: string;
  employeeId: string;
  locale: string;
  currentTitle: string;
};

export function KnowledgeSourceActions({
  sourceId,
  employeeId,
  locale,
  currentTitle,
}: KnowledgeSourceActionsProps) {
  const t = useTranslations(
    "aiEmployeeKnowledge.sourceActions",
  );

  const router = useRouter();

  const [renameOpen, setRenameOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [title, setTitle] =
    useState(currentTitle);

  const [error, setError] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  function openRenameDialog() {
    setTitle(currentTitle);
    setError(null);
    setRenameOpen(true);
  }

  function handleRename() {
    const normalizedTitle =
      title.trim();

    if (!normalizedTitle || isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        await renameKnowledgeSourceAction({
          sourceId,
          employeeId,
          locale,
          title: normalizedTitle,
        });

      if (!result.success) {
        setError(
          result.fieldErrors?.title?.[0] ??
            result.error ??
            t("genericError"),
        );

        return;
      }

      setRenameOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        await deleteKnowledgeSourceAction({
          sourceId,
          employeeId,
          locale,
        });

      if (!result.success) {
        setError(
          result.error ??
            t("genericError"),
        );

        return;
      }

      router.push(
        `/${locale}/dashboard/employees/${employeeId}/knowledge`,
      );

      router.refresh();
    });
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={openRenameDialog}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          <Pencil className="size-4" />
          {t("rename")}
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setError(null);
            setDeleteOpen(true);
          }}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          <Trash2 className="size-4" />
          {t("delete")}
        </Button>
      </div>

      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setRenameOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("renameTitle")}
            </DialogTitle>

            <DialogDescription>
              {t("renameDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label
              htmlFor="knowledge-source-title"
              className="text-sm font-medium"
            >
              {t("titleLabel")}
            </label>

            <Input
              id="knowledge-source-title"
              value={title}
              maxLength={160}
              disabled={isPending}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleRename();
                }
              }}
            />

            <div className="flex items-center justify-between gap-4">
              {error ? (
                <p className="text-xs text-destructive">
                  {error}
                </p>
              ) : (
                <span />
              )}

              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {title.length}/160
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setRenameOpen(false)
              }
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleRename}
              disabled={
                isPending ||
                !title.trim() ||
                title.trim() ===
                  currentTitle.trim()
              }
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setDeleteOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("deleteTitle")}
            </DialogTitle>

            <DialogDescription>
              {t("deleteDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="break-words text-sm font-medium">
              {currentTitle}
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDeleteOpen(false)
              }
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  {t("confirmDelete")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

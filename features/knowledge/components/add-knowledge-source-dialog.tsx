"use client";

import {
  ArrowLeft,
  FileText,
  Globe,
  HelpCircle,
  NotebookPen,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaqSourceForm } from "@/features/knowledge/components/faq-source-form";
import { NoteSourceForm } from "@/features/knowledge/components/note-source-form";
import { PdfSourceForm } from "@/features/knowledge/components/pdf-source-form";
import { WebsiteSourceForm } from "@/features/knowledge/components/website-source-form";

type SourceType =
  | "website"
  | "pdf"
  | "faq"
  | "note";

type AddKnowledgeSourceDialogProps = {
  employeeId: string;
  locale: string;
};

type SourceOption = {
  key: SourceType;
  icon: typeof Globe;
};

const sourceOptions: SourceOption[] = [
  {
    key: "website",
    icon: Globe,
  },
  {
    key: "pdf",
    icon: FileText,
  },
  {
    key: "faq",
    icon: HelpCircle,
  },
  {
    key: "note",
    icon: NotebookPen,
  },
];

export function AddKnowledgeSourceDialog({
  employeeId,
  locale,
}: AddKnowledgeSourceDialogProps) {
  const t = useTranslations(
    "aiEmployeeKnowledge.addSource",
  );

  const [open, setOpen] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState<SourceType | null>(null);

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedType(null);
    }
  }

  function renderSelectedForm() {
    if (selectedType === "website") {
      return (
        <WebsiteSourceForm
          employeeId={employeeId}
          locale={locale}
        />
      );
    }

    if (selectedType === "pdf") {
      return (
        <PdfSourceForm
          employeeId={employeeId}
          locale={locale}
          onSuccess={() =>
            handleOpenChange(false)
          }
        />
      );
    }

    if (selectedType === "faq") {
      return (
        <FaqSourceForm
          employeeId={employeeId}
          locale={locale}
          onSuccess={() =>
            handleOpenChange(false)
          }
        />
      );
    }

    if (selectedType === "note") {
      return (
        <NoteSourceForm
          employeeId={employeeId}
          locale={locale}
        />
      );
    }

    return null;
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        {t("button")}
      </Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
          {selectedType ? (
            <>
              <DialogHeader>
                <div className="mb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2"
                    onClick={() =>
                      setSelectedType(null)
                    }
                  >
                    <ArrowLeft className="size-4" />
                    {t("back")}
                  </Button>
                </div>

                <DialogTitle>
                  {t(
                    `selected.${selectedType}.title`,
                  )}
                </DialogTitle>

                <DialogDescription>
                  {t(
                    `selected.${selectedType}.description`,
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="min-w-0 pt-4">
                {renderSelectedForm()}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("dialogTitle")}
                </DialogTitle>

                <DialogDescription>
                  {t("dialogDescription")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                {sourceOptions.map(
                  (option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() =>
                          setSelectedType(
                            option.key,
                          )
                        }
                        className="flex min-h-32 items-start gap-4 rounded-xl border p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                          <Icon className="size-5 text-muted-foreground" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {t(
                              `options.${option.key}.title`,
                            )}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {t(
                              `options.${option.key}.description`,
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Globe,
  HelpCircle,
  NotebookPen,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteSourceForm } from "@/features/knowledge/components/note-source-form";
import { WebsiteSourceForm } from "@/features/knowledge/components/website-source-form";

type SourceType = "website" | "pdf" | "faq" | "note";

type AddKnowledgeSourceDialogProps = {
  employeeId: string;
  locale: string;
};

const options = [
  {
    key: "website",
    icon: Globe,
    title: "Website",
    description: "Import pages from your website",
  },
  {
    key: "pdf",
    icon: FileText,
    title: "PDF",
    description: "Upload manuals and documents",
  },
  {
    key: "faq",
    icon: HelpCircle,
    title: "FAQ",
    description: "Create structured questions and answers",
  },
  {
    key: "note",
    icon: NotebookPen,
    title: "Note",
    description: "Write custom knowledge manually",
  },
] satisfies Array<{
  key: SourceType;
  icon: typeof Globe;
  title: string;
  description: string;
}>;

export function AddKnowledgeSourceDialog({
  employeeId,
  locale,
}: AddKnowledgeSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] =
    useState<SourceType | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedType(null);
    }
  }

  const isWebsite = selectedType === "website";
  const isNote = selectedType === "note";

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add knowledge source
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          {selectedType ? (
            <>
              <DialogHeader>
                <div className="mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedType(null)}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                </div>

                <DialogTitle>
                  {isWebsite ? "Add Website" : "Add Note"}
                </DialogTitle>

                <DialogDescription>
                  {isWebsite
                    ? "Add a public website that this AI Employee can use as a knowledge source."
                    : "Write custom knowledge that this AI Employee can use in conversations."}
                </DialogDescription>
              </DialogHeader>

              <div className="pt-4">
                {isWebsite ? (
                  <WebsiteSourceForm
                    employeeId={employeeId}
                    locale={locale}
                  />
                ) : null}

                {isNote ? (
                  <NoteSourceForm
                    employeeId={employeeId}
                    locale={locale}
                  />
                ) : null}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add Knowledge Source</DialogTitle>

                <DialogDescription>
                  Choose how you want to add knowledge to this AI Employee.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 pt-4">
                {options.map((option) => {
                  const Icon = option.icon;
                  const isAvailable =
                    option.key === "website" || option.key === "note";

                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedType(option.key);
                        }
                      }}
                      className="flex items-center gap-4 rounded-xl border p-5 text-left transition-all hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent"
                    >
                      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                        <Icon className="size-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold">
                            {option.title}
                          </h3>

                          {!isAvailable ? (
                            <span className="rounded-full border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                              Coming soon
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
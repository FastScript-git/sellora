"use client";

import {
  Globe,
  FileText,
  HelpCircle,
  NotebookPen,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const options = [
  {
    icon: Globe,
    title: "Website",
    description: "Import pages from your website",
  },
  {
    icon: FileText,
    title: "PDF",
    description: "Upload manuals and documents",
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Create structured questions & answers",
  },
  {
    icon: NotebookPen,
    title: "Note",
    description: "Write custom knowledge manually",
  },
];

export function AddKnowledgeSourceDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
  Add knowledge source
</DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Knowledge Source</DialogTitle>

          <DialogDescription>
            Choose how you want to add knowledge to this AI Employee.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-4">
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.title}
                type="button"
                className="flex items-center gap-4 rounded-xl border p-5 text-left transition-all hover:border-primary hover:bg-accent"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {option.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
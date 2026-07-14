import { BookOpen, Plus } from "lucide-react";
import { AddKnowledgeSourceDialog } from "./add-knowledge-source-dialog";
import { Button } from "@/components/ui/button";

export function KnowledgeEmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <BookOpen className="h-7 w-7 text-muted-foreground" />
      </div>

      <h3 className="mt-6 text-2xl font-semibold">
        No knowledge sources yet
      </h3>

      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        Add websites, PDFs, FAQs or notes that your AI Employee will use
        when answering customers.
      </p>

      <AddKnowledgeSourceDialog />
    </div>
  );
}
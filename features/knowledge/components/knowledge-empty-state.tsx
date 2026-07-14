import { BookOpen } from "lucide-react";

import { AddKnowledgeSourceDialog } from "@/features/knowledge/components/add-knowledge-source-dialog";

type KnowledgeEmptyStateProps = {
  employeeId: string;
  locale: string;
  compact?: boolean;
};

export function KnowledgeEmptyState({
  employeeId,
  locale,
  compact = false,
}: KnowledgeEmptyStateProps) {
  if (compact) {
    return (
      <AddKnowledgeSourceDialog
        employeeId={employeeId}
        locale={locale}
      />
    );
  }

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <BookOpen className="size-7 text-muted-foreground" />
      </div>

      <h3 className="mt-6 text-2xl font-semibold">
        No knowledge sources yet
      </h3>

      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        Add websites, PDFs, FAQs or notes that your AI Employee will use
        when answering customers.
      </p>

      <div className="mt-8">
        <AddKnowledgeSourceDialog
          employeeId={employeeId}
          locale={locale}
        />
      </div>
    </div>
  );
}
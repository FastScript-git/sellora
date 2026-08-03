"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/dashboard/shared/empty-state";
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
  const t = useTranslations(
    "aiEmployeeKnowledge.empty",
  );

  if (compact) {
    return (
      <AddKnowledgeSourceDialog
        employeeId={employeeId}
        locale={locale}
      />
    );
  }

  return (
    <EmptyState
      icon={BookOpen}
      title={t("title")}
      description={t("description")}
      footer={
        <AddKnowledgeSourceDialog
          employeeId={employeeId}
          locale={locale}
        />
      }
    />
  );
}

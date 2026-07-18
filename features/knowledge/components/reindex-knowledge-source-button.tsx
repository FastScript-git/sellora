"use client";

import { Button } from "@/components/ui/button";

type ReindexKnowledgeSourceButtonProps = {
  sourceId: string;
  employeeId: string;
  locale: string;
};

export function ReindexKnowledgeSourceButton({
  sourceId,
  employeeId,
  locale,
}: ReindexKnowledgeSourceButtonProps) {
  void sourceId;
  void employeeId;
  void locale;

  return (
    <Button type="button">
      Re-index
    </Button>
  );
}
import { getTranslations } from "next-intl/server";

import { KnowledgeEmptyState } from "@/features/knowledge/components/knowledge-empty-state";

type KnowledgePageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function KnowledgePage({
  params,
}: KnowledgePageProps) {
  await params;

  const t = await getTranslations("knowledge");

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>

        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </section>

      <KnowledgeEmptyState />
    </div>
  );
}
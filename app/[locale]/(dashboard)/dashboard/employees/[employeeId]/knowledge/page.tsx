import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { KnowledgeEmptyState } from "@/features/knowledge/components/knowledge-empty-state";
import { KnowledgeList } from "@/features/knowledge/components/knowledge-list";
import { getKnowledgeSources } from "@/features/knowledge/queries";
import { aiEmployeeBelongsToWorkspace } from "@/features/knowledge/repositories/knowledge-access.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type KnowledgePageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function KnowledgePage({
  params,
}: KnowledgePageProps) {
  const { locale, employeeId } = await params;
  const t = await getTranslations("knowledge");

  const workspace = await getCurrentWorkspace();

  const hasAccess = await aiEmployeeBelongsToWorkspace({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!hasAccess) {
    notFound();
  }

  const sources = await getKnowledgeSources({
    employeeId,
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("title")}
          </h1>

          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {sources.length > 0 ? (
          <KnowledgeEmptyState
            employeeId={employeeId}
            locale={locale}
            compact
          />
        ) : null}
      </section>

      {sources.length === 0 ? (
        <KnowledgeEmptyState
          employeeId={employeeId}
          locale={locale}
        />
      ) : (
        <KnowledgeList sources={sources} />
      )}
    </div>
  );
}
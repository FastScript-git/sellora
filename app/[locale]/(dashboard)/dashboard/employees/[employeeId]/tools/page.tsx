import {
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { AIToolsManager } from "@/features/ai-tools/components/ai-tools-manager";
import { getAIEmployeeTools } from "@/features/ai-tools/repositories/ai-tool.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ToolsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function ToolsPage({
  params,
}: ToolsPageProps) {
  const { locale, employeeId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace: "aiEmployeeTools",
      }),
    ]);

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const tools =
    await getAIEmployeeTools({
      employeeId: employee.id,
    });

  return (
    <div className="space-y-4">
      <PageHeader
        compact
        icon={Wrench}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {t("security")}
          </PageHeaderNote>
        }
      />

      <AIToolsManager
        employeeId={employee.id}
        locale={locale}
        tools={tools.map((tool) => ({
          key: tool.key,
          isEnabled: tool.isEnabled,
        }))}
      />
    </div>
  );
}

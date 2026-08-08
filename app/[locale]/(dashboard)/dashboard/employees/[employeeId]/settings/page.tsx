import {
  Settings,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import { AIEmployeeSettingsForm } from "@/features/ai-employees/components/ai-employee-settings-form";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type SettingsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function SettingsPage({
  params,
}: SettingsPageProps) {
  const { locale, employeeId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace:
          "aiEmployeeSettings",
      }),
    ]);

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        compact
        icon={Settings}
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

      <AIEmployeeSettingsForm
        employeeId={employee.id}
        locale={locale}
        initialValues={{
          name: employee.name,
          role: employee.role,
          description:
            employee.description ?? "",
          status: employee.status,
        }}
      />
    </div>
  );
}

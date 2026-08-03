import {
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { TestChatPanel } from "@/features/test-chat/components/test-chat-panel";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type TestChatPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function TestChatPage({
  params,
}: TestChatPageProps) {
  const { locale, employeeId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace:
          "aiEmployeeTestChat",
      }),
    ]);

  const employee =
    await getAIEmployee({
      employeeId,
      workspaceId: workspace.id,
    });

  if (!employee) {
    notFound();
  }

  return (
    <div className="min-w-0 space-y-4 pb-6">
      <PageHeader
        compact
        icon={FlaskConical}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {t("safePreview")}
          </PageHeaderNote>
        }
      />

      <TestChatPanel
        employeeId={employee.id}
        employeeName={employee.name}
        employeeStatus={employee.status}
      />
    </div>
  );
}

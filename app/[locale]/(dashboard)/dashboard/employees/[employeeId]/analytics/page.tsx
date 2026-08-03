import {
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { EmployeeAnalyticsCards } from "@/features/analytics/components/employee-analytics-cards";
import { RecentConversationsTable } from "@/features/analytics/components/recent-conversations-table";
import { getEmployeeAnalytics } from "@/features/analytics/repositories/employee-analytics.repository";
import { getRecentEmployeeConversations } from "@/features/analytics/repositories/recent-conversations.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type EmployeeAnalyticsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function EmployeeAnalyticsPage({
  params,
}: EmployeeAnalyticsPageProps) {
  const { locale, employeeId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace:
          "aiEmployeeAnalytics",
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

  const [analytics, conversations] =
    await Promise.all([
      getEmployeeAnalytics(
        employee.id,
      ),
      getRecentEmployeeConversations(
        employee.id,
      ),
    ]);

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        compact
        icon={BarChart3}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {t("note")}
          </PageHeaderNote>
        }
      />

      <EmployeeAnalyticsCards
        conversations={
          analytics.conversations
        }
        messages={analytics.messages}
        contacts={analytics.contacts}
        knowledgeSources={
          analytics.knowledgeSources
        }
        locale={locale}
      />

      <RecentConversationsTable
        conversations={conversations}
        employeeId={employee.id}
        locale={locale}
      />
    </div>
  );
}

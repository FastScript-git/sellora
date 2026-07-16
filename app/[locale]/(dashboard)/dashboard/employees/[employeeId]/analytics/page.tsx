import { notFound } from "next/navigation";

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
  const { locale, employeeId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const [analytics, conversations] = await Promise.all([
    getEmployeeAnalytics(employee.id),
    getRecentEmployeeConversations(employee.id),
  ]);

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Аналітика",
        description:
          "Ключові показники роботи AI Employee та останні розмови.",
      }
    : {
        title: "Analytics",
        description:
          "Key AI Employee metrics and recent conversations.",
      };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          {copy.title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {copy.description}
        </p>
      </section>

      <EmployeeAnalyticsCards
        conversations={analytics.conversations}
        messages={analytics.messages}
        contacts={analytics.contacts}
        knowledgeSources={analytics.knowledgeSources}
      />

      <RecentConversationsTable
        conversations={conversations}
        employeeId={employee.id}
        locale={locale}
      />
    </div>
  );
}
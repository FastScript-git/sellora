import { notFound } from "next/navigation";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { EmployeeAnalyticsCards } from "@/features/analytics/components/employee-analytics-cards";
import { getEmployeeAnalytics } from "@/features/analytics/repositories/employee-analytics.repository";
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

  const analytics = await getEmployeeAnalytics(employee.id);

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Аналітика",
        description:
          "Переглядайте ключові показники роботи цього ШІ-співробітника.",
        activityTitle: "Активність",
        activityDescription:
          "Графіки активності та розширені показники з’являться в наступному кроці.",
      }
    : {
        title: "Analytics",
        description:
          "Review the key performance metrics for this AI Employee.",
        activityTitle: "Activity",
        activityDescription:
          "Activity charts and advanced metrics will be added in the next step.",
      };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          {copy.title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </section>

      <EmployeeAnalyticsCards
        conversations={analytics.conversations}
        messages={analytics.messages}
        contacts={analytics.contacts}
        knowledgeSources={analytics.knowledgeSources}
      />

      <section className="rounded-2xl border border-dashed bg-card px-6 py-12">
        <h3 className="font-semibold">
          {copy.activityTitle}
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.activityDescription}
        </p>
      </section>
    </div>
  );
}
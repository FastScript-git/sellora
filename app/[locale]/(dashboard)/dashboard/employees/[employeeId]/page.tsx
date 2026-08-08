import {
  CalendarDays,
  Languages,
  MessageSquareText,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  EmployeeConfigurationCard,
  type EmployeeConfigurationItem,
} from "@/features/ai-employees/components/employee-configuration-card";
import { EmployeeDescriptionCard } from "@/features/ai-employees/components/employee-description-card";
import { EmployeeReadinessCard } from "@/features/ai-employees/components/employee-readiness-card";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { EmployeeAnalyticsCards } from "@/features/analytics/components/employee-analytics-cards";
import { RecentConversationsTable } from "@/features/analytics/components/recent-conversations-table";
import { getEmployeeAnalytics } from "@/features/analytics/repositories/employee-analytics.repository";
import { getRecentEmployeeConversations } from "@/features/analytics/repositories/recent-conversations.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type AIEmployeeOverviewPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function AIEmployeeOverviewPage({
  params,
}: AIEmployeeOverviewPageProps) {
  const {
    locale,
    employeeId,
  } = await params;

  const workspace =
    await getCurrentWorkspace();

  const employee =
    await getAIEmployee({
      employeeId,
      workspaceId:
        workspace.id,
    });

  if (!employee) {
    notFound();
  }

  const [
    analytics,
    recentConversations,
  ] = await Promise.all([
    getEmployeeAnalytics(
      employee.id,
    ),

    getRecentEmployeeConversations(
      employee.id,
    ),
  ]);

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        readinessTitle:
          "Готовність AI Employee",

        readinessDescription:
          "Перевірте основні параметри, які впливають на якість і стабільність відповідей.",

        ready:
          "Готовий до роботи",

        needsSetup:
          "Потрібне налаштування",

        completed:
          "Завершено",

        configuration:
          "Конфігурація",

        configurationDescription:
          "Основні параметри цього AI Employee.",

        language:
          "Мова",

        tone:
          "Тон",

        created:
          "Створено",

        updated:
          "Оновлено",

        status:
          "Статус",

        notSet:
          "Не налаштовано",

        readinessItems: {
          description:
            "Опис",

          tone:
            "Тон спілкування",

          identity:
            "Ідентичність",

          goals:
            "Цілі",

          rules:
            "Правила",

          responseStyle:
            "Стиль відповідей",

          restrictions:
            "Обмеження",
        },
      }
    : {
        readinessTitle:
          "AI Employee readiness",

        readinessDescription:
          "Review the core configuration that affects response quality and reliability.",

        ready:
          "Ready to work",

        needsSetup:
          "Setup required",

        completed:
          "Completed",

        configuration:
          "Configuration",

        configurationDescription:
          "Core settings for this AI Employee.",

        language:
          "Language",

        tone:
          "Tone",

        created:
          "Created",

        updated:
          "Updated",

        status:
          "Status",

        notSet:
          "Not configured",

        readinessItems: {
          description:
            "Description",

          tone:
            "Communication tone",

          identity:
            "Identity",

          goals:
            "Goals",

          rules:
            "Rules",

          responseStyle:
            "Response style",

          restrictions:
            "Restrictions",
        },
      };

  const readinessItems = [
    {
      key: "description",
      label:
        copy.readinessItems
          .description,
      complete: Boolean(
        employee.description?.trim(),
      ),
    },
    {
      key: "tone",
      label:
        copy.readinessItems.tone,
      complete: Boolean(
        employee.tone?.trim(),
      ),
    },
    {
      key: "identity",
      label:
        copy.readinessItems
          .identity,
      complete: Boolean(
        employee.identity?.trim(),
      ),
    },
    {
      key: "goals",
      label:
        copy.readinessItems.goals,
      complete: Boolean(
        employee.goals?.trim(),
      ),
    },
    {
      key: "rules",
      label:
        copy.readinessItems.rules,
      complete: Boolean(
        employee.rules?.trim(),
      ),
    },
    {
      key: "responseStyle",
      label:
        copy.readinessItems
          .responseStyle,
      complete: Boolean(
        employee.responseStyle?.trim(),
      ),
    },
    {
      key: "restrictions",
      label:
        copy.readinessItems
          .restrictions,
      complete: Boolean(
        employee.restrictions?.trim(),
      ),
    },
  ];

  const completedItems =
    readinessItems.filter(
      (item) => item.complete,
    ).length;

  const readinessPercentage =
    Math.round(
      (completedItems /
        readinessItems.length) *
        100,
    );

  const dateFormatter =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle: "medium",
      },
    );

  const configurationItems: EmployeeConfigurationItem[] =
    [
      {
        key: "status",
        label: copy.status,
        value: employee.status,
        icon: Settings2,
      },
      {
        key: "language",
        label: copy.language,
        value: employee.language,
        icon: Languages,
      },
      {
        key: "tone",
        label: copy.tone,
        value:
          employee.tone ||
          copy.notSet,
        icon: MessageSquareText,
      },
      {
        key: "created",
        label: copy.created,
        value:
          dateFormatter.format(
            employee.createdAt,
          ),
        icon: CalendarDays,
      },
      {
        key: "updated",
        label: copy.updated,
        value:
          dateFormatter.format(
            employee.updatedAt,
          ),
        icon: RefreshCw,
      },
    ];

  return (
    <div className="min-w-0 space-y-4">
      <EmployeeAnalyticsCards
        conversations={
          analytics.conversations
        }
        messages={
          analytics.messages
        }
        contacts={
          analytics.contacts
        }
        knowledgeSources={
          analytics.knowledgeSources
        }
        locale={locale}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <EmployeeReadinessCard
          title={
            copy.readinessTitle
          }
          description={
            copy.readinessDescription
          }
          readyLabel={
            copy.ready
          }
          needsSetupLabel={
            copy.needsSetup
          }
          completedLabel={
            copy.completed
          }
          readinessPercentage={
            readinessPercentage
          }
          completedItems={
            completedItems
          }
          items={
            readinessItems
          }
        />

        <EmployeeConfigurationCard
          title={
            copy.configuration
          }
          description={
            copy.configurationDescription
          }
          items={
            configurationItems
          }
        />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,1.2fr)]">
        <EmployeeDescriptionCard
          employeeId={employee.id}
          locale={locale}
          initialDescription={
            employee.description ?? ""
          }
        />

        <RecentConversationsTable
          conversations={
            recentConversations
          }
          employeeId={
            employee.id
          }
          locale={locale}
        />
      </section>
    </div>
  );
}

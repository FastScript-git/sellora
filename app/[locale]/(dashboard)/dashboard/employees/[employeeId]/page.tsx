import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Languages,
  MessageSquareText,
  Radio,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  TestTube2,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeReadinessCard } from "@/features/ai-employees/components/employee-readiness-card";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
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
  const { locale, employeeId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        readinessTitle: "Готовність ШІ-співробітника",
        readinessDescription:
          "Завершіть основні налаштування, щоб співробітник відповідав точніше та стабільніше.",
        ready: "Готовий до тестування",
        needsSetup: "Потрібне налаштування",
        completed: "Завершено",
        configuration: "Налаштування",
        configurationDescription:
          "Поточна конфігурація цього ШІ-співробітника.",
        quickActions: "Швидкі дії",
        quickActionsDescription:
          "Продовжуйте налаштування або протестуйте роботу співробітника.",
        overview: "Опис",
        noDescription: "Опис ще не додано.",
        language: "Мова",
        tone: "Тон",
        created: "Створено",
        updated: "Оновлено",
        status: "Статус",
        notSet: "Не налаштовано",
        readinessItems: {
          description: "Опис співробітника",
          tone: "Тон спілкування",
          identity: "Ідентичність",
          goals: "Цілі",
          rules: "Правила",
          responseStyle: "Стиль відповідей",
          restrictions: "Обмеження",
        },
        actions: {
          instructions: "Налаштувати інструкції",
          knowledge: "Додати базу знань",
          channels: "Підключити канали",
          tools: "Налаштувати інструменти",
          testChat: "Відкрити тестовий чат",
        },
      }
    : {
        readinessTitle: "AI Employee readiness",
        readinessDescription:
          "Complete the core configuration so the employee can respond more accurately and consistently.",
        ready: "Ready for testing",
        needsSetup: "Setup required",
        completed: "Completed",
        configuration: "Configuration",
        configurationDescription:
          "Current configuration for this AI Employee.",
        quickActions: "Quick actions",
        quickActionsDescription:
          "Continue the setup or test how the employee responds.",
        overview: "Description",
        noDescription: "No description has been added yet.",
        language: "Language",
        tone: "Tone",
        created: "Created",
        updated: "Updated",
        status: "Status",
        notSet: "Not configured",
        readinessItems: {
          description: "Employee description",
          tone: "Communication tone",
          identity: "Identity",
          goals: "Goals",
          rules: "Rules",
          responseStyle: "Response style",
          restrictions: "Restrictions",
        },
        actions: {
          instructions: "Configure instructions",
          knowledge: "Add knowledge",
          channels: "Connect channels",
          tools: "Configure tools",
          testChat: "Open test chat",
        },
      };

  const readinessItems = [
    {
      key: "description",
      label: copy.readinessItems.description,
      complete: Boolean(employee.description?.trim()),
    },
    {
      key: "tone",
      label: copy.readinessItems.tone,
      complete: Boolean(employee.tone?.trim()),
    },
    {
      key: "identity",
      label: copy.readinessItems.identity,
      complete: Boolean(employee.identity?.trim()),
    },
    {
      key: "goals",
      label: copy.readinessItems.goals,
      complete: Boolean(employee.goals?.trim()),
    },
    {
      key: "rules",
      label: copy.readinessItems.rules,
      complete: Boolean(employee.rules?.trim()),
    },
    {
      key: "responseStyle",
      label: copy.readinessItems.responseStyle,
      complete: Boolean(employee.responseStyle?.trim()),
    },
    {
      key: "restrictions",
      label: copy.readinessItems.restrictions,
      complete: Boolean(employee.restrictions?.trim()),
    },
  ];

  const completedItems = readinessItems.filter(
    (item) => item.complete,
  ).length;

  const readinessPercentage = Math.round(
    (completedItems / readinessItems.length) * 100,
  );

  const employeeBaseHref =
    `/${locale}/dashboard/employees/${employee.id}`;

  const quickActions = [
    {
      key: "instructions",
      label: copy.actions.instructions,
      href: `${employeeBaseHref}/instructions`,
      icon: SlidersHorizontal,
    },
    {
      key: "knowledge",
      label: copy.actions.knowledge,
      href: `${employeeBaseHref}/knowledge`,
      icon: BookOpen,
    },
    {
      key: "channels",
      label: copy.actions.channels,
      href: `${employeeBaseHref}/channels`,
      icon: Radio,
    },
    {
      key: "tools",
      label: copy.actions.tools,
      href: `${employeeBaseHref}/tools`,
      icon: Wrench,
    },
    {
      key: "testChat",
      label: copy.actions.testChat,
      href: `${employeeBaseHref}/test-chat`,
      icon: TestTube2,
    },
  ];

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

  const configurationItems = [
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
      value: employee.tone || copy.notSet,
      icon: MessageSquareText,
    },
    {
      key: "created",
      label: copy.created,
      value: dateFormatter.format(employee.createdAt),
      icon: CalendarDays,
    },
    {
      key: "updated",
      label: copy.updated,
      value: dateFormatter.format(employee.updatedAt),
      icon: RefreshCw,
    },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <EmployeeReadinessCard
          title={copy.readinessTitle}
          description={
            copy.readinessDescription
          }
          readyLabel={copy.ready}
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
          items={readinessItems}
        />

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">
              {copy.configuration}
            </CardTitle>

            <CardDescription>
              {copy.configurationDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {configurationItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="flex min-w-0 items-center justify-between gap-4 rounded-xl border bg-muted/10 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </span>

                    <span className="truncate text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>

                  <span className="max-w-[52%] break-words text-right text-sm font-medium capitalize">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">
              {copy.overview}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="min-h-32 rounded-xl border bg-muted/10 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {employee.description || copy.noDescription}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">
              {copy.quickActions}
            </CardTitle>

            <CardDescription>
              {copy.quickActionsDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.key}
                  href={action.href}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </span>

                  <span className="min-w-0 flex-1 break-words text-sm font-medium">
                    {action.label}
                  </span>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

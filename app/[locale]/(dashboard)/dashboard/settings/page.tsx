import {
  Bot,
  CalendarDays,
  ContactRound,
  Settings,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkspaceSettingsForm } from "@/features/workspace/components/workspace-settings-form";
import { getWorkspaceSettings } from "@/features/workspace/repositories/workspace.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

export const dynamic =
  "force-dynamic";

type WorkspaceSettingsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { locale } =
    await params;

  const currentWorkspace =
    await getCurrentWorkspace();

  const workspace =
    await getWorkspaceSettings({
      workspaceId:
        currentWorkspace.id,
    });

  if (!workspace) {
    notFound();
  }

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow:
          "Робочий простір",
        title:
          "Налаштування",
        description:
          "Керуйте основною інформацією та параметрами робочого простору Sellora.",

        generalTitle:
          "Загальна інформація",
        generalDescription:
          "Ці дані використовуються в панелі керування та робочому просторі.",

        nameLabel:
          "Назва робочого простору",
        nameDescription:
          "Назву бачитимуть учасники вашого робочого простору.",
        slugLabel:
          "Workspace slug",
        slugDescription:
          "Slug є системним ідентифікатором. У цій версії він не змінюється.",
        save:
          "Зберегти зміни",
        saving:
          "Збереження...",

        overviewTitle:
          "Огляд робочого простору",
        overviewDescription:
          "Поточні ресурси, створені в цьому workspace.",

        aiEmployees:
          "ШІ-співробітники",
        contacts:
          "Контакти",
        workflows:
          "Автоматизації",
        meetings:
          "Зустрічі",

        securityTitle:
          "Безпека та доступ",
        securityDescription:
          "Після підключення авторизації тут з’являться учасники, ролі та керування доступом.",
        securityNotice:
          "Зараз Sellora працює в режимі Demo Workspace. Перед публічним запуском потрібно підключити авторизацію та ізоляцію даних користувачів.",

        created:
          "Створено",
        updated:
          "Оновлено",
      }
    : {
        eyebrow:
          "Workspace",
        title:
          "Settings",
        description:
          "Manage the core information and configuration of your Sellora workspace.",

        generalTitle:
          "General information",
        generalDescription:
          "These details are used throughout the dashboard and workspace.",

        nameLabel:
          "Workspace name",
        nameDescription:
          "This name is visible to members of your workspace.",
        slugLabel:
          "Workspace slug",
        slugDescription:
          "The slug is a system identifier and cannot be changed in this version.",
        save:
          "Save changes",
        saving:
          "Saving...",

        overviewTitle:
          "Workspace overview",
        overviewDescription:
          "Current resources created in this workspace.",

        aiEmployees:
          "AI Employees",
        contacts:
          "Contacts",
        workflows:
          "Automations",
        meetings:
          "Meetings",

        securityTitle:
          "Security and access",
        securityDescription:
          "Members, roles and access controls will appear here after authentication is connected.",
        securityNotice:
          "Sellora currently runs in Demo Workspace mode. Authentication and user data isolation must be connected before a public launch.",

        created:
          "Created",
        updated:
          "Updated",
      };

  const dateFormatter =
    new Intl.DateTimeFormat(
      isUkrainian
        ? "uk-UA"
        : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

  const metrics = [
    {
      key: "employees",
      label: copy.aiEmployees,
      value:
        workspace._count.aiEmployees,
      icon: Bot,
    },
    {
      key: "contacts",
      label: copy.contacts,
      value:
        workspace._count.contacts,
      icon: ContactRound,
    },
    {
      key: "workflows",
      label: copy.workflows,
      value:
        workspace._count.workflows,
      icon: Workflow,
    },
    {
      key: "meetings",
      label: copy.meetings,
      value:
        workspace._count.meetings,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Settings className="size-3.5" />
          {copy.eyebrow}
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </header>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              {copy.generalTitle}
            </CardTitle>

            <CardDescription>
              {copy.generalDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <WorkspaceSettingsForm
              locale={locale}
              initialName={
                workspace.name
              }
              slug={workspace.slug}
              translations={{
                nameLabel:
                  copy.nameLabel,
                nameDescription:
                  copy.nameDescription,
                slugLabel:
                  copy.slugLabel,
                slugDescription:
                  copy.slugDescription,
                save: copy.save,
                saving:
                  copy.saving,
              }}
            />
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {copy.overviewTitle}
              </CardTitle>

              <CardDescription>
                {
                  copy.overviewDescription
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {metrics.map(
                (metric) => {
                  const Icon =
                    metric.icon;

                  return (
                    <div
                      key={metric.key}
                      className="flex items-center justify-between gap-4 rounded-xl border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
                        </span>

                        <span className="truncate text-sm text-muted-foreground">
                          {metric.label}
                        </span>
                      </div>

                      <span className="shrink-0 font-semibold tabular-nums">
                        {metric.value}
                      </span>
                    </div>
                  );
                },
              )}

              <div className="border-t pt-4 text-xs leading-5 text-muted-foreground">
                <p>
                  {copy.created}:{" "}
                  {dateFormatter.format(
                    workspace.createdAt,
                  )}
                </p>

                <p className="mt-1">
                  {copy.updated}:{" "}
                  {dateFormatter.format(
                    workspace.updatedAt,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                </span>

                <div>
                  <CardTitle className="text-base">
                    {copy.securityTitle}
                  </CardTitle>

                  <CardDescription className="mt-1">
                    {
                      copy.securityDescription
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-600 dark:text-amber-400">
                {copy.securityNotice}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

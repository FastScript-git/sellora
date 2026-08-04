import { currentUser } from "@clerk/nextjs/server";
import {
  Bot,
  CalendarDays,
  ContactRound,
  Mail,
  Settings,
  ShieldCheck,
  UserRound,
  Workflow,
} from "lucide-react";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/shared/page-header";
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

export const dynamic = "force-dynamic";

type WorkspaceSettingsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { locale } = await params;

  const [currentWorkspace, clerkUser] =
    await Promise.all([
      getCurrentWorkspace(),
      currentUser(),
    ]);

  if (!clerkUser) {
    notFound();
  }

  const workspace =
    await getWorkspaceSettings({
      workspaceId: currentWorkspace.id,
    });

  if (!workspace) {
    notFound();
  }

  const isUkrainian = locale === "uk";

  const primaryEmail =
    clerkUser.primaryEmailAddress
      ?.emailAddress ??
    clerkUser.emailAddresses[0]
      ?.emailAddress ??
    "—";

  const fullName = [
    clerkUser.firstName,
    clerkUser.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const ownerName =
    fullName ||
    primaryEmail ||
    (isUkrainian
      ? "Користувач Sellora"
      : "Sellora user");

  const copy = isUkrainian
    ? {
        eyebrow: "Робочий простір",
        title: "Налаштування",
        description:
          "Керуйте інформацією, ресурсами та доступом до свого робочого простору Sellora.",

        generalTitle:
          "Загальна інформація",
        generalDescription:
          "Ці дані використовуються в панелі керування та інших розділах Sellora.",

        nameLabel:
          "Назва робочого простору",
        nameDescription:
          "Цю назву бачитимуть учасники вашого робочого простору.",
        slugLabel: "Workspace slug",
        slugDescription:
          "Slug є системним ідентифікатором і поки що не змінюється.",
        save: "Зберегти зміни",
        saving: "Збереження...",

        overviewTitle:
          "Огляд робочого простору",
        overviewDescription:
          "Ресурси, створені у вашому workspace.",

        aiEmployees:
          "ШІ-співробітники",
        contacts: "Контакти",
        workflows: "Автоматизації",
        meetings: "Зустрічі",

        accessTitle:
          "Власник і доступ",
        accessDescription:
          "Поточний акаунт має доступ власника до цього робочого простору.",
        owner: "Власник",
        email: "Email",
        role: "Роль",
        ownerRole:
          "Власник робочого простору",
        protected:
          "Доступ до Dashboard захищений авторизацією Clerk, а дані ізольовані в межах вашого workspace.",

        created: "Створено",
        updated: "Оновлено",
      }
    : {
        eyebrow: "Workspace",
        title: "Settings",
        description:
          "Manage the information, resources, and access for your Sellora workspace.",

        generalTitle:
          "General information",
        generalDescription:
          "These details are used throughout the Sellora dashboard and workspace.",

        nameLabel: "Workspace name",
        nameDescription:
          "This name is visible to members of your workspace.",
        slugLabel: "Workspace slug",
        slugDescription:
          "The slug is a system identifier and cannot be changed yet.",
        save: "Save changes",
        saving: "Saving...",

        overviewTitle:
          "Workspace overview",
        overviewDescription:
          "Resources created inside your workspace.",

        aiEmployees: "AI Employees",
        contacts: "Contacts",
        workflows: "Automations",
        meetings: "Meetings",

        accessTitle: "Owner and access",
        accessDescription:
          "The current account has owner access to this workspace.",
        owner: "Owner",
        email: "Email",
        role: "Role",
        ownerRole: "Workspace owner",
        protected:
          "Dashboard access is protected by Clerk authentication, and data is isolated inside your workspace.",

        created: "Created",
        updated: "Updated",
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
      value: workspace._count.aiEmployees,
      icon: Bot,
    },
    {
      key: "contacts",
      label: copy.contacts,
      value: workspace._count.contacts,
      icon: ContactRound,
    },
    {
      key: "workflows",
      label: copy.workflows,
      value: workspace._count.workflows,
      icon: Workflow,
    },
    {
      key: "meetings",
      label: copy.meetings,
      value: workspace._count.meetings,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        icon={Settings}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

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
              initialName={workspace.name}
              slug={workspace.slug}
              translations={{
                nameLabel: copy.nameLabel,
                nameDescription:
                  copy.nameDescription,
                slugLabel: copy.slugLabel,
                slugDescription:
                  copy.slugDescription,
                save: copy.save,
                saving: copy.saving,
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
                {copy.overviewDescription}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.key}
                    className="flex min-w-0 items-center justify-between gap-4 rounded-xl border p-3"
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
              })}

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

                <div className="min-w-0">
                  <CardTitle className="text-base">
                    {copy.accessTitle}
                  </CardTitle>

                  <CardDescription className="mt-1">
                    {copy.accessDescription}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <AccountItem
                icon={UserRound}
                label={copy.owner}
                value={ownerName}
              />

              <AccountItem
                icon={Mail}
                label={copy.email}
                value={primaryEmail}
              />

              <AccountItem
                icon={ShieldCheck}
                label={copy.role}
                value={copy.ownerRole}
              />

              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-6 text-emerald-700 dark:text-emerald-400">
                {copy.protected}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type AccountItemProps = {
  icon: typeof UserRound;
  label: string;
  value: string;
};

function AccountItem({
  icon: Icon,
  label,
  value,
}: AccountItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}
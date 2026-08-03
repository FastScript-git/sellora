import Link from "next/link";
import {
  Bot,
  Camera,
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe2,
  MessageCircle,
  MessagesSquare,
  Radio,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getWorkspaceChannelEmployees,
  getWorkspaceChannels,
} from "@/features/channels/repositories/channel.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type ChannelsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const upcomingChannels = [
  {
    key: "telegram",
    icon: Send,
  },
  {
    key: "whatsapp",
    icon: Smartphone,
  },
  {
    key: "messenger",
    icon: MessagesSquare,
  },
  {
    key: "instagram",
    icon: Camera,
  },
  {
    key: "api",
    icon: Code2,
  },
] as const;

export default async function ChannelsPage({
  params,
}: ChannelsPageProps) {
  const { locale } = await params;

  const workspace =
    await getCurrentWorkspace();

  const [channels, employees] =
    await Promise.all([
      getWorkspaceChannels(
        workspace.id,
      ),
      getWorkspaceChannelEmployees(
        workspace.id,
      ),
    ]);

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Інтеграції",
        title: "Канали",
        description:
          "Керуйте каналами, через які клієнти взаємодіють із вашими ШІ-співробітниками.",

        totalChannels:
          "Усього каналів",
        activeChannels:
          "Активних",
        conversations:
          "Розмов",
        events:
          "Подій віджета",

        websiteWidgets:
          "Website Widgets",
        websiteDescription:
          "Віджети, підключені до ваших ШІ-співробітників.",

        noWidgetsTitle:
          "Website Widget ще не створено",
        noWidgetsDescription:
          "Відкрийте канали потрібного ШІ-співробітника, щоб створити й налаштувати віджет.",
        openEmployee:
          "Відкрити ШІ-співробітника",

        employee:
          "ШІ-співробітник",
        widgetKey:
          "Ключ віджета",
        domains:
          "Доменів",
        status:
          "Статус",
        active:
          "Активний",
        disabled:
          "Вимкнений",
        updated:
          "Оновлено",
        configure:
          "Налаштувати",

        futureChannels:
          "Інші канали",
        futureDescription:
          "Ці інтеграції будуть підключені до єдиного Inbox Sellora.",
        comingSoon:
          "Скоро",

        telegram:
          "Telegram",
        whatsapp:
          "WhatsApp",
        messenger:
          "Messenger",
        instagram:
          "Instagram",
        api:
          "API",

        telegramDescription:
          "Підключення Telegram Bot до ШІ-співробітника.",
        whatsappDescription:
          "Повідомлення WhatsApp через Business API.",
        messengerDescription:
          "Інтеграція з Facebook Messenger.",
        instagramDescription:
          "Обробка повідомлень Instagram Direct.",
        apiDescription:
          "Власні інтеграції через Sellora API.",
      }
    : {
        eyebrow: "Integrations",
        title: "Channels",
        description:
          "Manage the channels customers use to interact with your AI Employees.",

        totalChannels:
          "Total channels",
        activeChannels:
          "Active",
        conversations:
          "Conversations",
        events:
          "Widget events",

        websiteWidgets:
          "Website Widgets",
        websiteDescription:
          "Widgets connected to your AI Employees.",

        noWidgetsTitle:
          "No Website Widgets yet",
        noWidgetsDescription:
          "Open an AI Employee channel page to create and configure a widget.",
        openEmployee:
          "Open AI Employee",

        employee:
          "AI Employee",
        widgetKey:
          "Widget key",
        domains:
          "Domains",
        status:
          "Status",
        active:
          "Active",
        disabled:
          "Disabled",
        updated:
          "Updated",
        configure:
          "Configure",

        futureChannels:
          "More channels",
        futureDescription:
          "These integrations will connect to the unified Sellora Inbox.",
        comingSoon:
          "Coming soon",

        telegram:
          "Telegram",
        whatsapp:
          "WhatsApp",
        messenger:
          "Messenger",
        instagram:
          "Instagram",
        api:
          "API",

        telegramDescription:
          "Connect a Telegram Bot to an AI Employee.",
        whatsappDescription:
          "WhatsApp messaging through the Business API.",
        messengerDescription:
          "Integration with Facebook Messenger.",
        instagramDescription:
          "Handle Instagram Direct messages.",
        apiDescription:
          "Build custom integrations through the Sellora API.",
      };

  const totalConversations =
    channels.reduce(
      (total, channel) =>
        total +
        channel._count.conversations,
      0,
    );

  const totalEvents =
    channels.reduce(
      (total, channel) =>
        total +
        channel._count.widgetEvents,
      0,
    );

  const activeChannels =
    channels.filter(
      (channel) =>
        channel.isEnabled,
    ).length;

  const metrics = [
    {
      key: "total",
      label:
        copy.totalChannels,
      value: channels.length,
      icon: Radio,
    },
    {
      key: "active",
      label:
        copy.activeChannels,
      value: activeChannels,
      icon: CheckCircle2,
    },
    {
      key: "conversations",
      label:
        copy.conversations,
      value:
        totalConversations,
      icon: MessageCircle,
    },
    {
      key: "events",
      label: copy.events,
      value: totalEvents,
      icon: ShieldCheck,
    },
  ];

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

  return (
    <div className="min-w-0 space-y-6">
      <header className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {copy.eyebrow}
        </p>

        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(
            (metric, index) => {
              const Icon =
                metric.icon;

              return (
                <div
                  key={metric.key}
                  className={[
                    "flex min-h-24 items-center gap-3 px-4 py-4",
                    index > 0
                      ? "border-t sm:border-l sm:border-t-0"
                      : "",
                    index === 2
                      ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0"
                      : "",
                  ].join(" ")}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {metric.label}
                    </p>

                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {metric.value}
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="min-w-0 space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {copy.websiteWidgets}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {copy.websiteDescription}
          </p>
        </div>

        {channels.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-80 flex-col items-center justify-center px-4 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
                <Globe2 className="size-5 text-muted-foreground" />
              </span>

              <h3 className="mt-5 text-lg font-semibold">
                {copy.noWidgetsTitle}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {
                  copy.noWidgetsDescription
                }
              </p>

              {employees[0] ? (
                <Link
                  href={`/${locale}/dashboard/employees/${employees[0].id}/channels`}
                  className={cn(
                    buttonVariants(),
                    "mt-6",
                  )}
                >
                  {copy.openEmployee}

                  <ExternalLink className="size-4" />
                </Link>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {channels.map(
              (channel) => {
                const settingsHref =
                  `/${locale}/dashboard/employees/` +
                  `${channel.employeeId}/channels`;

                return (
                  <Card
                    key={channel.id}
                    className="w-full overflow-hidden"
                  >
                    <CardHeader className="border-b">
                      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                            <Globe2 className="size-5 text-muted-foreground" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle className="break-words text-base">
                                {channel.name}
                              </CardTitle>

                              <Badge
                                variant="outline"
                                className={cn(
                                  "w-fit shrink-0",
                                  channel.isEnabled
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                                    : "text-muted-foreground",
                                )}
                              >
                                <span
                                  className={cn(
                                    "mr-1.5 size-1.5 rounded-full",
                                    channel.isEnabled
                                      ? "bg-emerald-500"
                                      : "bg-muted-foreground",
                                  )}
                                />

                                {channel.isEnabled
                                  ? copy.active
                                  : copy.disabled}
                              </Badge>
                            </div>

                            <CardDescription className="mt-1 break-words">
                              {
                                channel.employee
                                  .name
                              }
                            </CardDescription>
                          </div>
                        </div>

                        <Link
                          href={settingsHref}
                          className={cn(
                            buttonVariants({
                              variant:
                                "outline",
                            }),
                            "w-full shrink-0 gap-2 sm:w-auto",
                          )}
                        >
                          {copy.configure}

                          <ExternalLink className="size-4" />
                        </Link>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5">
                      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(150px,0.8fr)_minmax(260px,1.5fr)_minmax(120px,0.6fr)_minmax(180px,1fr)]">
                        <InfoItem
                          icon={Bot}
                          label={copy.employee}
                          value={
                            channel.employee
                              .name
                          }
                        />

                        <InfoItem
                          icon={ShieldCheck}
                          label={copy.status}
                          value={
                            channel.isEnabled
                              ? copy.active
                              : copy.disabled
                          }
                        />

                        <InfoItem
                          icon={Code2}
                          label={copy.widgetKey}
                          value={
                            channel.widgetKey ??
                            "—"
                          }
                          monospace
                        />

                        <InfoItem
                          icon={Globe2}
                          label={copy.domains}
                          value={
                            channel.allowedDomains
                              .length
                          }
                        />

                        <div className="min-w-0 rounded-xl border bg-muted/10 p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5 shrink-0" />

                            <span>
                              {copy.updated}
                            </span>
                          </div>

                          <time
                            dateTime={channel.updatedAt.toISOString()}
                            className="mt-2 block break-words text-sm font-medium"
                          >
                            {dateFormatter.format(
                              channel.updatedAt,
                            )}
                          </time>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="min-w-0 space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {copy.futureChannels}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {copy.futureDescription}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {upcomingChannels.map(
            (channel) => {
              const Icon =
                channel.icon;

              return (
                <Card
                  key={channel.key}
                  className="min-w-0"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>

                      <Badge variant="outline">
                        {copy.comingSoon}
                      </Badge>
                    </div>

                    <h3 className="mt-4 font-semibold">
                      {copy[channel.key]}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        copy[
                          `${channel.key}Description`
                        ]
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}

type InfoItemProps = {
  icon: typeof Bot;
  label: string;
  value: string | number;
  monospace?: boolean;
};

function InfoItem({
  icon: Icon,
  label,
  value,
  monospace = false,
}: InfoItemProps) {
  return (
    <div className="min-w-0 rounded-xl border bg-muted/10 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />

        <span>{label}</span>
      </div>

      <p
        className={cn(
          "mt-2 break-words text-sm font-medium",
          monospace &&
            "break-all font-mono text-xs leading-5",
        )}
      >
        {value}
      </p>
    </div>
  );
}

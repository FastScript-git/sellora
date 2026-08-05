import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Circle,
  Code2,
  Globe2,
  MessageCircle,
  Settings2,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
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
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { WidgetDesigner } from "@/features/channels/components/widget-designer";
import { ensureWebsiteChannel } from "@/features/channels/services/channel.service";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type ChannelsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function ChannelsPage({
  params,
}: ChannelsPageProps) {
  const { locale, employeeId } =
    await params;

  const requestHeaders =
    await headers();

  const forwardedHost =
    requestHeaders.get(
      "x-forwarded-host",
    );

  const host =
    forwardedHost ??
    requestHeaders.get("host") ??
    "app.sellora.ai";

  const forwardedProtocol =
    requestHeaders.get(
      "x-forwarded-proto",
    );

  const protocol =
    forwardedProtocol ??
    (host.startsWith("localhost")
      ? "http"
      : "https");

  const installationOrigin =
    `${protocol}://${host}`;

  const workspace =
    await getCurrentWorkspace();

  const employee =
    await getAIEmployee({
      employeeId,
      workspaceId: workspace.id,
    });

  if (!employee) {
    notFound();
  }

  const websiteChannel =
    await ensureWebsiteChannel(
      employee.id,
    );

  if (!websiteChannel.widgetKey) {
    throw new Error(
      "Website channel does not contain a widget key.",
    );
  }

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Канал Website",
        title: "Website Widget",
        description:
          "Налаштуйте зовнішній вигляд, скопіюйте код встановлення та підключіть ШІ-співробітника до вашого сайту.",

        active: "Активний",
        disabled: "Вимкнений",
        employee: "ШІ-співробітник",
        channel: "Канал",
        widgetKey: "Ключ віджета",
        websiteChannel: "Website",

        quickStartTitle:
          "Швидкий старт",
        quickStartDescription:
          "Встановіть віджет на сайт за три прості кроки.",

        steps: [
          {
            title:
              "Налаштуйте віджет",
            description:
              "Вкажіть назву, привітання, колір і позицію.",
          },
          {
            title: "Скопіюйте код",
            description:
              "Код встановлення знаходиться поруч із попереднім переглядом.",
          },
          {
            title:
              "Вставте код на сайт",
            description:
              "Додайте script перед закривальним тегом </body>.",
          },
        ],

        designerTitle:
          "Налаштування та перегляд",
        designerDescription:
          "Усі зміни одразу відображаються у попередньому перегляді.",

        analytics:
          "Відкрити аналітику віджета",

        statusTitle:
          "Статус підключення",
        statusDescription:
          "Канал готовий приймати повідомлення з вашого сайту.",
        ready:
          "Готовий до встановлення",

        comingSoonTitle:
          "Інші канали",
        comingSoonDescription:
          "Telegram, WhatsApp, Messenger та Instagram з’являться у наступних спринтах.",
      }
    : {
        eyebrow: "Website channel",
        title: "Website Widget",
        description:
          "Customize the appearance, copy the installation code and connect this AI Employee to your website.",

        active: "Active",
        disabled: "Disabled",
        employee: "AI Employee",
        channel: "Channel",
        widgetKey: "Widget key",
        websiteChannel: "Website",

        quickStartTitle:
          "Quick start",
        quickStartDescription:
          "Install the widget on your website in three simple steps.",

        steps: [
          {
            title:
              "Customize the widget",
            description:
              "Configure the title, greeting, color and position.",
          },
          {
            title: "Copy the code",
            description:
              "The installation code is available next to the preview.",
          },
          {
            title:
              "Paste it into your website",
            description:
              "Add the script before the closing </body> tag.",
          },
        ],

        designerTitle:
          "Configuration and preview",
        designerDescription:
          "Every change is immediately reflected in the live preview.",

        analytics:
          "Open Widget Analytics",

        statusTitle:
          "Connection status",
        statusDescription:
          "The channel is ready to receive website conversations.",
        ready:
          "Ready to install",

        comingSoonTitle:
          "More channels",
        comingSoonDescription:
          "Telegram, WhatsApp, Messenger and Instagram will be added in future sprints.",
      };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        compact
        icon={Globe2}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        aside={
          <PageHeaderNote
            icon={CheckCircle2}
            tone={
              websiteChannel.isEnabled
                ? "success"
                : "warning"
            }
          >
            {websiteChannel.isEnabled
              ? copy.active
              : copy.disabled}
          </PageHeaderNote>
        }
        actions={
          <Link
            href={`/${locale}/dashboard/analytics/widget`}
            className={cn(
              buttonVariants({
                variant: "outline",
              }),
              "w-full gap-2 sm:w-auto",
            )}
          >
            <BarChart3 className="size-4 shrink-0" />

            <span className="break-words">
              {copy.analytics}
            </span>
          </Link>
        }
      />

      <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={MessageCircle}
          label={copy.employee}
          value={employee.name}
        />

        <InfoCard
          icon={Globe2}
          label={copy.channel}
          value={copy.websiteChannel}
        />

        <InfoCard
          icon={Code2}
          label={copy.widgetKey}
          value={
            websiteChannel.widgetKey
          }
          monospace
        />
      </section>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="break-words">
            {copy.quickStartTitle}
          </CardTitle>

          <CardDescription className="break-words leading-6">
            {copy.quickStartDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            {copy.steps.map(
              (step, index) => (
                <div
                  key={step.title}
                  className="relative min-w-0 rounded-xl border bg-muted/10 p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium">
                        {step.title}
                      </p>

                      <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                        {
                          step.description
                        }
                      </p>
                    </div>
                  </div>

                  {index <
                  copy.steps.length - 1 ? (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 rounded-full bg-background text-muted-foreground lg:block" />
                  ) : null}
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <section className="min-w-0 space-y-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Settings2 className="size-4 text-muted-foreground" />
          </span>

          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold tracking-tight">
              {copy.designerTitle}
            </h2>

            <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
              {
                copy.designerDescription
              }
            </p>
          </div>
        </div>

        <WidgetDesigner
          channelId={
            websiteChannel.id
          }
          employeeId={employee.id}
          locale={locale}
          widgetKey={
            websiteChannel.widgetKey
          }
          installationOrigin={
            installationOrigin
          }
          isEnabled={
            websiteChannel.isEnabled
          }
          widgetTitle={
            websiteChannel.widgetTitle
          }
          widgetGreeting={
            websiteChannel.widgetGreeting
          }
          widgetPrimaryColor={
            websiteChannel.widgetPrimaryColor ??
            "#2563eb"
          }
          widgetPosition={
            websiteChannel.widgetPosition ??
            "bottom-right"
          }
          allowedDomains={
            websiteChannel.allowedDomains
          }
        />
      </section>

      <Card className="min-w-0">
        <CardHeader>
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                websiteChannel.isEnabled
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "bg-muted/40",
              )}
            >
              {websiteChannel.isEnabled ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </span>

            <div className="min-w-0">
              <CardTitle className="break-words">
                {copy.statusTitle}
              </CardTitle>

              <CardDescription className="mt-1 break-words leading-6">
                {
                  copy.statusDescription
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-medium">
                {copy.ready}
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                {employee.name} ·{" "}
                {copy.websiteChannel}
              </p>
            </div>

            <Link
              href={`/${locale}/dashboard/analytics/widget`}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                }),
                "w-full shrink-0 gap-2 sm:w-auto",
              )}
            >
              <span className="break-words">
                {copy.analytics}
              </span>

              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="min-w-0 rounded-2xl border border-dashed bg-card px-4 py-6 sm:px-6 sm:py-8">
        <h2 className="break-words font-semibold">
          {copy.comingSoonTitle}
        </h2>

        <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
          {
            copy.comingSoonDescription
          }
        </p>
      </section>
    </div>
  );
}

type InfoCardProps = {
  icon: typeof Globe2;
  label: string;
  value: string;
  monospace?: boolean;
};

function InfoCard({
  icon: Icon,
  label,
  value,
  monospace = false,
}: InfoCardProps) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex min-w-0 items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
          <Icon className="size-4 text-muted-foreground" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="break-words text-xs text-muted-foreground">
            {label}
          </p>

          <p
            className={cn(
              "mt-1 break-words text-sm font-medium",
              monospace &&
                "break-all font-mono text-xs leading-5",
            )}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

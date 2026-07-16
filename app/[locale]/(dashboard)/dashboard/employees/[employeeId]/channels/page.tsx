import { notFound } from "next/navigation";

import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { WidgetDesigner } from "@/features/channels/components/widget-designer";
import { WidgetInstallationCard } from "@/features/channels/components/widget-installation-card";
import { ensureWebsiteChannel } from "@/features/channels/services/channel.service";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ChannelsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function ChannelsPage({
  params,
}: ChannelsPageProps) {
  const { locale, employeeId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const websiteChannel = await ensureWebsiteChannel(employee.id);

  if (!websiteChannel.widgetKey) {
    throw new Error(
      "Website channel does not contain a widget key.",
    );
  }

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        pageTitle: "Канали",
        pageDescription:
          "Налаштовуйте віджет сайту та підключайте ШІ-співробітника до каналів спілкування з клієнтами.",
        designerTitle: "Дизайнер віджета",
        designerDescription:
          "Налаштуйте вигляд і привітання віджета перед встановленням на сайт.",
        websiteTitle: "Віджет для сайту",
        websiteDescription:
          "Додайте Sellora на свій сайт за допомогою одного script-тега.",
        statusEnabled: "Активний",
        statusDisabled: "Вимкнений",
        widgetKey: "Ключ віджета",
        installationTitle: "Код встановлення",
        installationDescription:
          "Вставте цей код перед закривальним тегом </body> на вашому сайті.",
        copyScript: "Копіювати",
        copied: "Скопійовано",
        comingSoonTitle: "Інші канали",
        comingSoonDescription:
          "Telegram, WhatsApp, Messenger та Instagram з’являться в наступних спринтах.",
      }
    : {
        pageTitle: "Channels",
        pageDescription:
          "Customize the website widget and connect this AI Employee to customer communication channels.",
        designerTitle: "Widget Designer",
        designerDescription:
          "Configure the appearance and greeting before installing the widget on your website.",
        websiteTitle: "Website Widget",
        websiteDescription:
          "Add Sellora to your website with a single script tag.",
        statusEnabled: "Enabled",
        statusDisabled: "Disabled",
        widgetKey: "Widget key",
        installationTitle: "Installation code",
        installationDescription:
          "Paste this code before the closing </body> tag on your website.",
        copyScript: "Copy script",
        copied: "Copied",
        comingSoonTitle: "More channels",
        comingSoonDescription:
          "Telegram, WhatsApp, Messenger and Instagram will be added in future sprints.",
      };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          {copy.pageTitle}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.pageDescription}
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {copy.designerTitle}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {copy.designerDescription}
          </p>
        </div>

        <WidgetDesigner
          channelId={websiteChannel.id}
          employeeId={employee.id}
          locale={locale}
          widgetKey={websiteChannel.widgetKey}
          widgetTitle={websiteChannel.widgetTitle}
          widgetGreeting={websiteChannel.widgetGreeting}
          widgetPrimaryColor={
            websiteChannel.widgetPrimaryColor ?? "#2563eb"
          }
          widgetPosition={
            websiteChannel.widgetPosition ?? "bottom-right"
          }
        />
      </section>

      <WidgetInstallationCard
        widgetKey={websiteChannel.widgetKey}
        channelName={copy.websiteTitle}
        enabled={websiteChannel.isEnabled}
        copy={{
          title: copy.websiteTitle,
          description: copy.websiteDescription,
          statusEnabled: copy.statusEnabled,
          statusDisabled: copy.statusDisabled,
          widgetKey: copy.widgetKey,
          installationTitle: copy.installationTitle,
          installationDescription:
            copy.installationDescription,
          copyScript: copy.copyScript,
          copied: copy.copied,
        }}
      />

      <section className="rounded-2xl border border-dashed bg-card px-6 py-10">
        <h2 className="font-semibold">
          {copy.comingSoonTitle}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.comingSoonDescription}
        </p>
      </section>
    </div>
  );
}
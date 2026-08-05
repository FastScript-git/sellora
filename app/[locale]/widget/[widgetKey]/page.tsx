export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { WebsiteChatWidget } from "@/features/widget/components/website-chat-widget";
import { prisma } from "@/lib/prisma";

type WidgetPageProps = {
  params: Promise<{
    locale: string;
    widgetKey: string;
  }>;

  searchParams: Promise<{
    embed?: string;
  }>;
};

export default async function WidgetPage({
  params,
  searchParams,
}: WidgetPageProps) {
  const { widgetKey } = await params;
  const query = await searchParams;

  const isEmbedded = query.embed === "1";

  const channel =
    await prisma.channel.findFirst({
      where: {
        widgetKey,
        type: "WEBSITE",
        isEnabled: true,
      },

      select: {
        widgetKey: true,
        widgetTitle: true,
        widgetGreeting: true,
        widgetPrimaryColor: true,

        employee: {
          select: {
            name: true,
          },
        },
      },
    });

  if (
    !channel ||
    !channel.widgetKey
  ) {
    notFound();
  }

  const widget = (
    <WebsiteChatWidget
      widgetKey={channel.widgetKey}
      title={
        channel.widgetTitle ||
        channel.employee.name
      }
      greeting={
        channel.widgetGreeting ||
        "Hello! How can I help you today?"
      }
      primaryColor={
        channel.widgetPrimaryColor ||
        "#2563eb"
      }
      employeeName={
        channel.employee.name
      }
      embedded={isEmbedded}
    />
  );

  if (isEmbedded) {
    return (
      <div className="light min-h-screen bg-white text-zinc-950">
        {widget}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
        <div className="max-w-xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Sellora Website Chat Preview
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Your website content
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This page simulates a customer website.
            Open the chat in the bottom-right corner and
            send a real message to your Sellora Inbox.
          </p>
        </div>
      </div>

      {widget}
    </main>
  );
}

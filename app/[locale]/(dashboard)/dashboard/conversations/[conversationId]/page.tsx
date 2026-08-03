export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Building2,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversationMessage } from "@/features/conversations/components/conversation-message";
import { getWorkspaceInboxConversation } from "@/features/conversations/repositories/inbox.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ConversationPageProps = {
  params: Promise<{
    locale: string;
    conversationId: string;
  }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { locale, conversationId } = await params;

  const workspace = await getCurrentWorkspace();

  const conversation =
    await getWorkspaceInboxConversation({
      workspaceId: workspace.id,
      conversationId,
    });

  if (!conversation) {
    notFound();
  }

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        back: "До розмов",
        fallbackTitle: "Розмова",
        messages: "повідомлень",
        noMessages: "У цій розмові поки немає повідомлень.",
        employee: "ШІ-співробітник",
        contact: "Контакт",
        anonymous: "Анонімний відвідувач",
        channel: "Канал",
        noChannel: "Канал не визначено",
        summary: "AI-резюме",
        noSummary: "AI-резюме поки не створено.",
        leadScore: "Оцінка ліда",
        sentiment: "Настрій",
        company: "Компанія",
      }
    : {
        back: "Back to conversations",
        fallbackTitle: "Conversation",
        messages: "messages",
        noMessages:
          "This conversation does not contain messages yet.",
        employee: "AI Employee",
        contact: "Contact",
        anonymous: "Anonymous visitor",
        channel: "Channel",
        noChannel: "Channel not assigned",
        summary: "AI Summary",
        noSummary: "No AI summary yet.",
        leadScore: "Lead score",
        sentiment: "Sentiment",
        company: "Company",
      };

  const contactName = conversation.contact
    ? [
        conversation.contact.firstName,
        conversation.contact.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      conversation.contact.email ||
      copy.anonymous
    : copy.anonymous;

  const conversationsHref =
    `/${locale}/dashboard/conversations`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={conversationsHref} />}
      >
        <ArrowLeft className="size-4" />
        {copy.back}
      </Button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="truncate text-xl">
                  {conversation.title || copy.fallbackTitle}
                </CardTitle>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {conversation.status}
                  </Badge>

                  {conversation.channel ? (
                    <Badge variant="secondary">
                      {conversation.channel.type}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
                <MessageSquare className="size-3.5" />
                {conversation._count.messages} {copy.messages}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {conversation.messages.length === 0 ? (
              <div className="flex min-h-96 items-center justify-center px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {copy.noMessages}
                </p>
              </div>
            ) : (
              <div className="space-y-5 px-5 py-6 sm:px-6">
                {conversation.messages.map((message) => (
                  <ConversationMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    metadata={message.metadata}
                    createdAt={message.createdAt}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {copy.employee}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <Bot className="size-4 text-muted-foreground" />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {conversation.employee.name}
                  </p>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {conversation.employee.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {copy.channel}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <MessageSquare className="size-4 text-muted-foreground" />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {conversation.channel?.name ||
                      copy.noChannel}
                  </p>

                  {conversation.channel ? (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {conversation.channel.type}
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {conversation.contact ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {copy.contact}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                    <UserRound className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {contactName}
                    </p>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {conversation.contact.jobTitle || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {conversation.contact.email ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">
                        {conversation.contact.email}
                      </span>
                    </div>
                  ) : null}

                  {conversation.contact.phone ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-4 shrink-0" />
                      <span className="truncate">
                        {conversation.contact.phone}
                      </span>
                    </div>
                  ) : null}

                  {conversation.contact.company ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="size-4 shrink-0" />
                      <span className="truncate">
                        {conversation.contact.company}
                      </span>
                    </div>
                  ) : null}
                </div>

                <section className="rounded-xl border bg-background/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.summary}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {conversation.contact.summary ||
                      copy.noSummary}
                  </p>
                </section>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {copy.leadScore}
                    </span>

                    <span className="font-semibold tabular-nums">
                      {conversation.contact.leadScore !== null
                        ? `${conversation.contact.leadScore}/100`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {copy.sentiment}
                    </span>

                    <span className="text-sm font-medium">
                      {conversation.contact.sentiment}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
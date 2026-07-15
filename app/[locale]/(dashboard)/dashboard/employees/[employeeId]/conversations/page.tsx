import Link from "next/link";
import { ArrowRight, MessageSquare, Plus } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getConversationsByEmployee } from "@/features/conversations/repositories/conversation.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ConversationsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function ConversationsPage({
  params,
}: ConversationsPageProps) {
  const { locale, employeeId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const conversations = await getConversationsByEmployee(
    employee.id,
  );

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Розмови",
        description:
          "Переглядайте збережені діалоги цього ШІ-співробітника.",
        newConversation: "Новий тестовий діалог",
        emptyTitle: "Розмов поки немає",
        emptyDescription:
          "Відкрийте Test Chat і надішліть перше повідомлення, щоб створити діалог.",
        openTestChat: "Відкрити Test Chat",
        messages: "повідомлень",
        untitled: "Новий діалог",
        noPreview: "У цьому діалозі ще немає повідомлень.",
      }
    : {
        title: "Conversations",
        description:
          "Review saved conversations handled by this AI Employee.",
        newConversation: "New test conversation",
        emptyTitle: "No conversations yet",
        emptyDescription:
          "Open Test Chat and send the first message to create a conversation.",
        openTestChat: "Open Test Chat",
        messages: "messages",
        untitled: "New conversation",
        noPreview: "This conversation does not contain messages yet.",
      };

  const testChatHref =
    `/${locale}/dashboard/employees/${employee.id}/test-chat`;

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {copy.title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href={testChatHref} />}
        >
          <Plus className="size-4" />
          {copy.newConversation}
        </Button>
      </section>

      {conversations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-96 flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
              <MessageSquare className="size-5 text-muted-foreground" />
            </span>

            <h2 className="mt-5 text-lg font-semibold">
              {copy.emptyTitle}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {copy.emptyDescription}
            </p>

            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href={testChatHref} />}
            >
              {copy.openTestChat}
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-3">
          {conversations.map((conversation) => {
            const latestMessage = conversation.messages[0];

            return (
              <Card
                key={conversation.id}
                className="transition-colors hover:border-foreground/15"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {conversation.title || copy.untitled}
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {dateFormatter.format(
                          conversation.updatedAt,
                        )}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                      {conversation._count.messages}{" "}
                      {copy.messages}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                      <MessageSquare className="size-4 text-muted-foreground" />
                    </span>

                    <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {latestMessage?.content ||
                        copy.noPreview}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
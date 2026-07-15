import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getEmployeeConversation } from "@/features/conversations/repositories/conversation.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type ConversationDetailsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
    conversationId: string;
  }>;
};

export default async function ConversationDetailsPage({
  params,
}: ConversationDetailsPageProps) {
  const { locale, employeeId, conversationId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const conversation = await getEmployeeConversation({
    conversationId,
    employeeId: employee.id,
  });

  if (!conversation) {
    notFound();
  }

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        back: "До розмов",
        title: conversation.title || "Розмова",
        description: `Повна історія діалогу з ${employee.name}.`,
        messages: "повідомлень",
        user: "Користувач",
        employee: employee.name,
        empty: "У цій розмові поки немає повідомлень.",
      }
    : {
        back: "Back to conversations",
        title: conversation.title || "Conversation",
        description: `Complete conversation history with ${employee.name}.`,
        messages: "messages",
        user: "User",
        employee: employee.name,
        empty: "This conversation does not contain any messages yet.",
      };

  const conversationsHref =
    `/${locale}/dashboard/employees/${employee.id}/conversations`;

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={conversationsHref} />}
      >
        <ArrowLeft className="size-4" />
        {copy.back}
      </Button>

      <section className="rounded-2xl border bg-card">
        <header className="border-b px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {copy.title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy.description}
              </p>
            </div>

            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              {conversation._count.messages} {copy.messages}
            </span>
          </div>
        </header>

        {conversation.messages.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {copy.empty}
            </p>
          </div>
        ) : (
          <div className="space-y-6 px-5 py-6 sm:px-6">
            {conversation.messages.map((message) => {
              const isUser = message.role === "USER";

              return (
                <article
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isUser && "flex-row-reverse",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {isUser ? (
                      <UserRound className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </span>

                  <div
                    className={cn(
                      "max-w-[82%]",
                      isUser && "text-right",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {isUser ? copy.user : copy.employee}
                      </span>

                      <span aria-hidden="true">·</span>

                      <time dateTime={message.createdAt.toISOString()}>
                        {dateFormatter.format(message.createdAt)}
                      </time>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-left text-sm leading-6",
                        isUser
                          ? "rounded-tr-md bg-primary text-primary-foreground"
                          : "rounded-tl-md border bg-background",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
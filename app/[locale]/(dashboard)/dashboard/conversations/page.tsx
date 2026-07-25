export const dynamic = "force-dynamic";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getWorkspaceInbox } from "@/features/conversations/repositories/inbox.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ConversationsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ConversationsPage({
  params,
}: ConversationsPageProps) {
  const { locale } = await params;

  const workspace = await getCurrentWorkspace();

  const conversations = await getWorkspaceInbox({
    workspaceId: workspace.id,
  });

  const isUk = locale === "uk";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isUk ? "Розмови" : "Conversations"}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {isUk
            ? "Усі діалоги робочого простору."
            : "All conversations in your workspace."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {conversations.length}{" "}
            {isUk ? "розмов" : "conversations"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {conversations.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              {isUk
                ? "Поки немає розмов."
                : "No conversations yet."}
            </div>
          ) : (
            conversations.map((conversation) => {
              const lastMessage =
                conversation.messages[0];

              return (
                <Link
                  key={conversation.id}
                  href={`/${locale}/dashboard/conversations/${conversation.id}`}
                  className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {conversation.title ??
                        (isUk
                          ? "Нова розмова"
                          : "New conversation")}
                    </div>

                    <div className="mt-1 truncate text-sm text-muted-foreground">
                      {lastMessage?.content ??
                        (isUk
                          ? "Без повідомлень"
                          : "No messages")}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      {conversation.employee.name}
                    </div>
                  </div>

                  <div className="ml-6 flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />

                    <span className="text-sm">
                      {conversation._count.messages}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
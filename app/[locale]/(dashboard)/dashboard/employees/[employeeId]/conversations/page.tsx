import {
  ArrowRight,
  MessageSquare,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
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
  const { locale, employeeId } =
    await params;

  const [workspace, t] =
    await Promise.all([
      getCurrentWorkspace(),
      getTranslations({
        locale,
        namespace:
          "aiEmployeeConversations",
      }),
    ]);

  const employee =
    await getAIEmployee({
      employeeId,
      workspaceId: workspace.id,
    });

  if (!employee) {
    notFound();
  }

  const conversations =
    await getConversationsByEmployee(
      employee.id,
    );

  const testChatHref =
    `/${locale}/dashboard/employees/${employee.id}/test-chat`;

  const dateFormatter =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        compact
        icon={MessageSquare}
        title={t("title")}
        description={t("description")}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {locale === "uk"
              ? "Тут зберігаються розмови лише цього ШІ-співробітника."
              : "Only conversations for this AI Employee are shown here."}
          </PageHeaderNote>
        }
        actions={
          <Button
            className="w-full shrink-0 sm:w-auto"
            nativeButton={false}
            render={
              <Link href={testChatHref} />
            }
          >
            <Plus className="size-4" />
            {t("newConversation")}
          </Button>
        }
      />

      {conversations.length === 0 ? (
        <Card className="min-w-0 border-dashed">
          <CardContent className="flex min-h-80 flex-col items-center justify-center px-4 py-12 text-center sm:min-h-96 sm:px-6 sm:py-16">
            <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
              <MessageSquare className="size-5 text-muted-foreground" />
            </span>

            <h2 className="mt-5 break-words text-lg font-semibold">
              {t("emptyTitle")}
            </h2>

            <p className="mt-2 max-w-md break-words text-sm leading-6 text-muted-foreground">
              {t("emptyDescription")}
            </p>

            <Button
              className="mt-6 w-full sm:w-auto"
              nativeButton={false}
              render={
                <Link href={testChatHref} />
              }
            >
              {t("openTestChat")}
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="min-w-0 space-y-3">
          {conversations.map(
            (conversation) => {
              const latestMessage =
                conversation.messages[0];

              const conversationHref =
                `/${locale}/dashboard/employees/${employee.id}` +
                `/conversations/${conversation.id}`;

              return (
                <Link
                  key={conversation.id}
                  href={conversationHref}
                  aria-label={t(
                    "openConversation",
                  )}
                  className="group block min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="min-w-0 transition-colors hover:border-foreground/20 hover:bg-muted/10">
                    <CardHeader className="pb-3">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <CardTitle className="break-words text-base sm:truncate">
                            {conversation.title ||
                              t("untitled")}
                          </CardTitle>

                          <time
                            dateTime={conversation.updatedAt.toISOString()}
                            className="mt-1 block text-xs leading-5 text-muted-foreground"
                          >
                            {dateFormatter.format(
                              conversation.updatedAt,
                            )}
                          </time>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                          <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                            {t(
                              "messageCount",
                              {
                                count:
                                  conversation
                                    ._count
                                    .messages,
                              },
                            )}
                          </span>

                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                          <MessageSquare className="size-4 text-muted-foreground" />
                        </span>

                        <p className="min-w-0 flex-1 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                          {latestMessage?.content ||
                            t("noPreview")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            },
          )}
        </section>
      )}
    </div>
  );
}

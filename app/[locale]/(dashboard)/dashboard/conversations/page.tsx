export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Inbox,
  MessageSquare,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationDetailsSidebar } from "@/features/conversations/components/conversation-details-sidebar";
import { ConversationsFilters } from "@/features/conversations/components/conversations-filters";
import { getConversationsCopy } from "@/features/conversations/copy";
import { ConversationThread } from "@/features/conversations/components/conversation-thread";
import { ConversationsLiveRefresh } from "@/features/conversations/components/conversations-live-refresh";
import {
  getWorkspaceInbox,
  getWorkspaceInboxConversation,
  getWorkspaceInboxFilterOptions,
  type InboxConversationStatus,
} from "@/features/conversations/repositories/inbox.repository";
import { getWorkspaceMembers } from "@/features/conversations/repositories/conversation.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type ConversationsPageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    conversationId?: string;
    search?: string;
    status?: string;
    employeeId?: string;
    channelId?: string;
  }>;
};

function normalizeStatus(
  status?: string,
): InboxConversationStatus {
  if (status === "OPEN" || status === "CLOSED") {
    return status;
  }

  return "ALL";
}

export default async function ConversationsPage({
  params,
  searchParams,
}: ConversationsPageProps) {
  const { locale } = await params;

  const {
    conversationId,
    search,
    status: rawStatus,
    employeeId,
    channelId,
  } = await searchParams;

  const workspace = await getCurrentWorkspace();

  const status = normalizeStatus(rawStatus);

  const [
    conversations,
    filterOptions,
    workspaceMembers,
  ] = await Promise.all([
    getWorkspaceInbox({
      workspaceId: workspace.id,
      search,
      status,
      employeeId,
      channelId,
    }),

    getWorkspaceInboxFilterOptions({
      workspaceId: workspace.id,
    }),

    getWorkspaceMembers(
      workspace.id,
    ),
  ]);

  const selectedConversationId =
    conversationId ?? conversations[0]?.id;

  const selectedConversation = selectedConversationId
    ? await getWorkspaceInboxConversation({
        workspaceId: workspace.id,
        conversationId: selectedConversationId,
      })
    : null;

  const isUkrainian = locale === "uk";

  const copy =
    getConversationsCopy(locale);

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const hasActiveFilters =
    Boolean(search?.trim()) ||
    status !== "ALL" ||
    Boolean(employeeId) ||
    Boolean(channelId);

  const createInboxUrl = ({
    nextConversationId,
    nextSearch = search,
    nextStatus = status,
    nextEmployeeId = employeeId,
    nextChannelId = channelId,
  }: {
    nextConversationId?: string;
    nextSearch?: string;
    nextStatus?: InboxConversationStatus;
    nextEmployeeId?: string;
    nextChannelId?: string;
  }) => {
    const query = new URLSearchParams();

    if (nextConversationId) {
      query.set("conversationId", nextConversationId);
    }

    if (nextSearch?.trim()) {
      query.set("search", nextSearch.trim());
    }

    if (nextStatus && nextStatus !== "ALL") {
      query.set("status", nextStatus);
    }

    if (nextEmployeeId) {
      query.set("employeeId", nextEmployeeId);
    }

    if (nextChannelId) {
      query.set("channelId", nextChannelId);
    }

    const queryString = query.toString();

    return queryString
      ? `/${locale}/dashboard/conversations?${queryString}`
      : `/${locale}/dashboard/conversations`;
  };

  const selectedContactName = selectedConversation?.contact
    ? [
        selectedConversation.contact.firstName,
        selectedConversation.contact.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      selectedConversation.contact.email ||
      copy.anonymous
    : copy.anonymous;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6 lg:flex lg:h-[calc(100dvh-7.5rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <ConversationsLiveRefresh />
      <section className="min-w-0 lg:shrink-0">
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </section>

      <div className="grid min-w-0 overflow-hidden rounded-xl border bg-card sm:rounded-2xl lg:min-h-0 lg:flex-1 lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b lg:flex lg:min-h-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="min-w-0 border-b p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  {copy.inbox}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {conversations.length} {copy.conversations}
                </p>
              </div>

              <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <Inbox className="size-4 text-muted-foreground" />
              </span>
            </div>

            <form
              action={`/${locale}/dashboard/conversations`}
              method="get"
              className="mt-4 space-y-3"
            >
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    name="search"
                    defaultValue={search}
                    placeholder={copy.searchPlaceholder}
                    className="pl-9"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full sm:w-auto">
                  {copy.searchButton}
                </Button>
              </div>

              {status !== "ALL" ? (
                <input
                  type="hidden"
                  name="status"
                  value={status}
                />
              ) : null}

              {employeeId ? (
                <input
                  type="hidden"
                  name="employeeId"
                  value={employeeId}
                />
              ) : null}

              {channelId ? (
                <input
                  type="hidden"
                  name="channelId"
                  value={channelId}
                />
              ) : null}

              <ConversationsFilters
                employeeId={employeeId}
                channelId={channelId}
                employees={
                  filterOptions.employees
                }
                channels={
                  filterOptions.channels
                }
                allEmployeesLabel={
                  copy.allEmployees
                }
                allChannelsLabel={
                  copy.allChannels
                }
              />
            </form>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <Link
                href={createInboxUrl({
                  nextStatus: "ALL",
                  nextConversationId: undefined,
                })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-muted",
                  status === "ALL" &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {copy.all}
              </Link>

              <Link
                href={createInboxUrl({
                  nextStatus: "OPEN",
                  nextConversationId: undefined,
                })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-muted",
                  status === "OPEN" &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {copy.open}
              </Link>

              <Link
                href={createInboxUrl({
                  nextStatus: "CLOSED",
                  nextConversationId: undefined,
                })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-muted",
                  status === "CLOSED" &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {copy.closed}
              </Link>
            </div>

            {hasActiveFilters ? (
            <Link
            href={`/${locale}/dashboard/conversations`}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <X className="size-4" />
            {copy.clearFilters}
            </Link>
          ) : null}
          </div>

          <div className="max-h-[420px] min-w-0 overflow-y-auto overscroll-contain sm:max-h-[580px] lg:min-h-0 lg:max-h-none lg:flex-1">
            {conversations.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/40">
                  <Search className="size-4 text-muted-foreground" />
                </span>

                <h3 className="mt-4 text-sm font-semibold">
                  {hasActiveFilters
                    ? copy.emptyTitle
                    : copy.noConversationsTitle}
                </h3>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {hasActiveFilters
                    ? copy.emptyDescription
                    : copy.noConversationsDescription}
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[0];

                const isSelected =
                  conversation.id ===
                  selectedConversation?.id;

                const conversationTitle =
                  conversation.contact
                    ? [
                        conversation.contact.firstName,
                        conversation.contact.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      conversation.contact.email ||
                      conversation.title ||
                      copy.fallbackTitle
                    : conversation.title ||
                      copy.fallbackTitle;

                const lastActivityAt =
                  conversation.lastMessageAt ??
                  lastMessage?.createdAt ??
                  conversation.updatedAt;

                return (
                  <Link
                    key={conversation.id}
                    href={createInboxUrl({
                      nextConversationId: conversation.id,
                    })}
                    className={cn(
                      "block min-w-0 border-b px-3 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-5",
                      isSelected && "bg-muted/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                        <UserRound className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                          <p className="min-w-0 truncate text-sm font-medium">
                            {conversationTitle}
                          </p>

                          <span className="shrink-0 text-[11px] text-muted-foreground sm:text-right">
                            {dateFormatter.format(
                              lastActivityAt,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {lastMessage?.content ||
                            copy.noPreview}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {conversation.status}
                          </Badge>

                          <Badge variant="secondary">
                            {conversation.channel?.type ||
                              "TEST"}
                          </Badge>

                          {conversation.unreadCount > 0 ? (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        <main className="min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
          {!selectedConversation ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[520px] sm:px-6 lg:min-h-0 lg:flex-1">
              <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
                <MessageSquare className="size-5 text-muted-foreground" />
              </span>

              <h2 className="mt-5 text-lg font-semibold">
                {copy.selectTitle}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {copy.selectDescription}
              </p>
            </div>
          ) : (
            <div className="grid min-w-0 lg:h-full lg:min-h-0 lg:flex-1 lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_260px] 2xl:grid-cols-[minmax(0,1fr)_280px]">
              <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                <header className="flex min-w-0 flex-col gap-3 border-b px-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold sm:text-lg">
                      {selectedConversation.title ||
                        selectedContactName ||
                        copy.fallbackTitle}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {selectedConversation.status}
                      </Badge>

                      <Badge variant="secondary">
                        {selectedConversation.channel?.type ||
                          "TEST"}
                      </Badge>
                    </div>
                  </div>

                  <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" />

                    {selectedConversation._count.messages}{" "}
                    {copy.messages}
                  </span>
                </header>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  {selectedConversation.messages.length ===
                  0 ? (
                    <div className="flex min-h-[320px] items-center justify-center px-4 py-10 text-center sm:min-h-[500px] sm:px-6 lg:min-h-0 lg:flex-1">
                      <p className="text-sm text-muted-foreground">
                        {copy.noMessages}
                      </p>
                    </div>
                  ) : (
                    <ConversationThread
                      key={
                        selectedConversation.messages.at(-1)?.id ??
                        selectedConversation.id
                      }
                      conversationId={
                        selectedConversation.id
                      }
                      initialMessages={
                        selectedConversation.messages
                      }
                      locale={locale}
                      showComposer
                      showAIReply
                      aiReplyDisabled={
                        selectedConversation.messages.length === 0 ||
                        selectedConversation.mode === "HUMAN"
                      }
                    />
                  )}
                </div>

              </section>

              <ConversationDetailsSidebar
                conversationId={
                  selectedConversation.id
                }
                mode={
                  selectedConversation.mode
                }
                assignedMemberId={
                  selectedConversation.assignedMemberId
                }
                members={workspaceMembers}
                locale={locale}
                employee={{
                  name:
                    selectedConversation.employee.name,
                  role:
                    selectedConversation.employee.role,
                }}
                contact={
                  selectedConversation.contact
                    ? {
                        company:
                          selectedConversation.contact
                            .company,
                        email:
                          selectedConversation.contact
                            .email,
                        phone:
                          selectedConversation.contact
                            .phone,
                        leadScore:
                          selectedConversation.contact
                            .leadScore,
                        sentiment:
                          selectedConversation.contact
                            .sentiment,
                      }
                    : null
                }
                contactName={
                  selectedContactName
                }
                copy={{
                  employee: copy.employee,
                  contact: copy.contact,
                  leadScore: copy.leadScore,
                  sentiment: copy.sentiment,
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Bot,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConversationHandoffCard } from "@/features/conversations/components/conversation-handoff-card";
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

  const copy = isUkrainian
    ? {
        title: "Розмови",
        description:
          "Усі діалоги клієнтів в одному робочому просторі.",
        inbox: "Вхідні",
        conversations: "розмов",
        emptyTitle: "Розмов не знайдено",
        emptyDescription:
          "Спробуйте змінити пошук або активні фільтри.",
        noConversationsTitle: "Розмов поки немає",
        noConversationsDescription:
          "Нові діалоги з Website Chat та підключених каналів з’являтимуться тут.",
        selectTitle: "Виберіть розмову",
        selectDescription:
          "Оберіть діалог зі списку, щоб переглянути повідомлення.",
        fallbackTitle: "Нова розмова",
        noPreview: "Повідомлень поки немає.",
        noMessages: "У цій розмові поки немає повідомлень.",
        messages: "повідомлень",
        employee: "ШІ-співробітник",
        contact: "Контакт",
        anonymous: "Анонімний відвідувач",
        leadScore: "Оцінка ліда",
        sentiment: "Настрій",
        searchPlaceholder: "Пошук розмов...",
        searchButton: "Знайти",
        all: "Усі",
        open: "Відкриті",
        closed: "Закриті",
        allEmployees: "Усі ШІ-співробітники",
        allChannels: "Усі канали",
        clearFilters: "Очистити",
        filters: "Фільтри",
      }
    : {
        title: "Conversations",
        description:
          "All customer conversations in one workspace.",
        inbox: "Inbox",
        conversations: "conversations",
        emptyTitle: "No conversations found",
        emptyDescription:
          "Try changing your search or active filters.",
        noConversationsTitle: "No conversations yet",
        noConversationsDescription:
          "New conversations from Website Chat and connected channels will appear here.",
        selectTitle: "Select a conversation",
        selectDescription:
          "Choose a conversation from the list to view its messages.",
        fallbackTitle: "New conversation",
        noPreview: "No messages yet.",
        noMessages:
          "This conversation does not contain messages yet.",
        messages: "messages",
        employee: "AI Employee",
        contact: "Contact",
        anonymous: "Anonymous visitor",
        leadScore: "Lead score",
        sentiment: "Sentiment",
        searchPlaceholder: "Search conversations...",
        searchButton: "Search",
        all: "All",
        open: "Open",
        closed: "Closed",
        allEmployees: "All AI Employees",
        allChannels: "All channels",
        clearFilters: "Clear",
        filters: "Filters",
      };

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
    <div className="space-y-6">
      <ConversationsLiveRefresh />
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          {copy.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </section>

      <div className="grid min-h-[720px] overflow-hidden rounded-2xl border bg-card lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="border-b lg:border-b-0 lg:border-r">
          <div className="border-b p-4">
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
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    name="search"
                    defaultValue={search}
                    placeholder={copy.searchPlaceholder}
                    className="pl-9"
                  />
                </div>

                <Button type="submit" size="sm">
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

              <div className="grid grid-cols-2 gap-2">
                <select
                  name="employeeId"
                  defaultValue={employeeId ?? ""}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">
                    {copy.allEmployees}
                  </option>

                  {filterOptions.employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>

                <select
                  name="channelId"
                  defaultValue={channelId ?? ""}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">
                    {copy.allChannels}
                  </option>

                  {filterOptions.channels.map((channel) => (
                    <option
                      key={channel.id}
                      value={channel.id}
                    >
                      {channel.name} · {channel.type}
                    </option>
                  ))}
                </select>
              </div>
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

          <div className="max-h-[580px] overflow-y-auto">
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
                      "block border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40",
                      isSelected && "bg-muted/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                        <UserRound className="size-4 text-muted-foreground" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-medium">
                            {conversationTitle}
                          </p>

                          <span className="shrink-0 text-[11px] text-muted-foreground">
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

        <main className="min-w-0">
          {!selectedConversation ? (
            <div className="flex min-h-[720px] flex-col items-center justify-center px-6 text-center">
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
            <div className="grid min-h-[720px] xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className="flex min-w-0 flex-col">
                <header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">
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

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                  {selectedConversation.messages.length ===
                  0 ? (
                    <div className="flex min-h-[500px] items-center justify-center px-6 text-center">
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

              <aside className="space-y-6 border-t bg-muted/10 p-5 xl:border-l xl:border-t-0">
                <section>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.employee}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                      <Bot className="size-4 text-muted-foreground" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {selectedConversation.employee.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {selectedConversation.employee.role}
                      </p>
                    </div>
                  </div>
                </section>

                <ConversationHandoffCard
                  conversationId={
                    selectedConversation.id
                  }
                  initialMode={
                    selectedConversation.mode
                  }
                  initialAssignedMemberId={
                    selectedConversation.assignedMemberId
                  }
                  members={workspaceMembers}
                  locale={locale}
                />

                <section className="border-t pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.contact}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                      <UserRound className="size-4 text-muted-foreground" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {selectedContactName}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {selectedConversation.contact?.company ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  {selectedConversation.contact ? (
                    <div className="mt-4 space-y-2">
                      {selectedConversation.contact.email ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="size-3.5 shrink-0" />

                          <span className="truncate">
                            {
                              selectedConversation.contact
                                .email
                            }
                          </span>
                        </div>
                      ) : null}

                      {selectedConversation.contact.phone ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />

                          <span className="truncate">
                            {
                              selectedConversation.contact
                                .phone
                            }
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <section className="space-y-3 border-t pt-5">
                  <Card>
                    <CardContent className="flex items-center justify-between p-3">
                      <span className="text-xs text-muted-foreground">
                        {copy.leadScore}
                      </span>

                      <span className="text-sm font-semibold tabular-nums">
                        {selectedConversation.contact
                          ?.leadScore !== null &&
                        selectedConversation.contact
                          ?.leadScore !== undefined
                          ? `${selectedConversation.contact.leadScore}/100`
                          : "—"}
                      </span>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center justify-between p-3">
                      <span className="text-xs text-muted-foreground">
                        {copy.sentiment}
                      </span>

                      <span className="text-xs font-medium">
                        {selectedConversation.contact
                          ?.sentiment || "—"}
                      </span>
                    </CardContent>
                  </Card>
                </section>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
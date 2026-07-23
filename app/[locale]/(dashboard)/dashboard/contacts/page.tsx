import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getContactsByWorkspace } from "@/features/contacts/repositories/contact.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type ContactsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function ContactsPage({
  params,
  searchParams,
}: ContactsPageProps) {
  const { locale } = await params;
  const { search = "" } = await searchParams;

  const normalizedSearch = search.trim();

  const workspace = await getCurrentWorkspace();
  const contacts = await getContactsByWorkspace(
    workspace.id,
    normalizedSearch || undefined,
  );

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Контакти",
        description:
          "Усі клієнти та відвідувачі, які взаємодіяли з вашими ШІ-співробітниками.",
        searchPlaceholder:
          "Пошук за ім’ям, email, телефоном або компанією",
        searchButton: "Знайти",
        clearSearch: "Очистити пошук",
        contactsCount: "контактів",
        searchResults: "результатів для",
        emptyTitle: "Контактів поки немає",
        emptyDescription:
          "Нові контакти автоматично з’являться після першої розмови через Website Widget.",
        noResultsTitle: "Контактів не знайдено",
        noResultsDescription:
          "Спробуйте змінити пошуковий запит або очистити пошук.",
        anonymous: "Анонімний відвідувач",
        conversations: "розмов",
        noConversation: "Розмов ще немає",
        noMessage: "Повідомлень ще немає",
        openContact: "Відкрити контакт",
        unknownEmployee: "ШІ-співробітник",
      }
    : {
        title: "Contacts",
        description:
          "All customers and visitors who interacted with your AI Employees.",
        searchPlaceholder:
          "Search by name, email, phone, or company",
        searchButton: "Search",
        clearSearch: "Clear search",
        contactsCount: "contacts",
        searchResults: "results for",
        emptyTitle: "No contacts yet",
        emptyDescription:
          "New contacts will appear automatically after the first Website Widget conversation.",
        noResultsTitle: "No contacts found",
        noResultsDescription:
          "Try changing your search query or clearing the search.",
        anonymous: "Anonymous visitor",
        conversations: "conversations",
        noConversation: "No conversations yet",
        noMessage: "No messages yet",
        openContact: "Open contact",
        unknownEmployee: "AI Employee",
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const contactsHref = `/${locale}/dashboard/contacts`;
  const hasSearch = normalizedSearch.length > 0;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          {copy.title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </section>

      <section>
        <form
          action={contactsHref}
          method="get"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              name="search"
              type="search"
              defaultValue={normalizedSearch}
              placeholder={copy.searchPlaceholder}
              className="h-11 pl-10"
            />
          </div>

          <Button type="submit" className="h-11 sm:px-6">
            {copy.searchButton}
          </Button>

          {hasSearch ? (
            <Link
              href={contactsHref}
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "h-11",
              )}
            >
              <X className="size-4" />
              {copy.clearSearch}
            </Link>
          ) : null}
        </form>
      </section>

      <section className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {hasSearch ? (
            <>
              <span className="font-medium text-foreground">
                {contacts.length}
              </span>{" "}
              {copy.searchResults}{" "}
              <span className="font-medium text-foreground">
                “{normalizedSearch}”
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">
                {contacts.length}
              </span>{" "}
              {copy.contactsCount}
            </>
          )}
        </p>
      </section>

      {contacts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-96 flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/40">
              {hasSearch ? (
                <Search className="size-5 text-muted-foreground" />
              ) : (
                <UserRound className="size-5 text-muted-foreground" />
              )}
            </span>

            <h2 className="mt-5 text-lg font-semibold">
              {hasSearch
                ? copy.noResultsTitle
                : copy.emptyTitle}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {hasSearch
                ? copy.noResultsDescription
                : copy.emptyDescription}
            </p>

            {hasSearch ? (
              <Link
                href={contactsHref}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "mt-5",
                )}
              >
                {copy.clearSearch}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4">
          {contacts.map((contact) => {
            const latestConversation =
              contact.conversations[0];
            const latestMessage =
              latestConversation?.messages[0];

            const fullName = [
              contact.firstName,
              contact.lastName,
            ]
              .filter(Boolean)
              .join(" ");

            const displayName =
              fullName || contact.email || copy.anonymous;

            const contactHref =
              `/${locale}/dashboard/contacts/${contact.id}`;

            return (
              <Link
                key={contact.id}
                href={contactHref}
                aria-label={copy.openContact}
                className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="transition-colors hover:border-foreground/20 hover:bg-muted/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                          <UserRound className="size-5 text-muted-foreground" />
                        </span>

                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">
                            {displayName}
                          </CardTitle>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {dateFormatter.format(
                              contact.updatedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                          {contact._count.conversations}{" "}
                          {copy.conversations}
                        </span>

                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="size-4 shrink-0" />

                        <span className="truncate">
                          {contact.email || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="size-4 shrink-0" />

                        <span className="truncate">
                          {contact.phone || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="size-4 shrink-0" />

                        <span className="truncate">
                          {contact.company || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-background/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <MessageSquare className="size-4 shrink-0 text-muted-foreground" />

                          <p className="truncate text-sm font-medium">
                            {latestConversation?.title ||
                              copy.noConversation}
                          </p>
                        </div>

                        {latestConversation ? (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {latestConversation.employee.name ||
                              copy.unknownEmployee}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 truncate text-sm text-muted-foreground">
                        {latestMessage?.content ||
                          copy.noMessage}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
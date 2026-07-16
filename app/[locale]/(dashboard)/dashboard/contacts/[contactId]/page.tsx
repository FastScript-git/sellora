import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContactDetails } from "@/features/contacts/repositories/contact.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type ContactDetailsPageProps = {
  params: Promise<{
    locale: string;
    contactId: string;
  }>;
};

export default async function ContactDetailsPage({
  params,
}: ContactDetailsPageProps) {
  const { locale, contactId } = await params;

  const workspace = await getCurrentWorkspace();

  const contact = await getContactDetails({
    contactId,
    workspaceId: workspace.id,
  });

  if (!contact) {
    notFound();
  }

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        back: "До контактів",
        anonymous: "Анонімний відвідувач",
        profile: "Профіль",
        conversations: "Розмови",
        noConversations: "У цього контакту ще немає розмов.",
        messages: "повідомлень",
        noMessage: "Повідомлень ще немає",
        notes: "Нотатки",
        noNotes: "Нотаток поки немає.",
        email: "Email",
        phone: "Телефон",
        company: "Компанія",
        jobTitle: "Посада",
        openConversation: "Відкрити розмову",
      }
    : {
        back: "Back to contacts",
        anonymous: "Anonymous visitor",
        profile: "Profile",
        conversations: "Conversations",
        noConversations: "This contact does not have conversations yet.",
        messages: "messages",
        noMessage: "No messages yet",
        notes: "Notes",
        noNotes: "No notes yet.",
        email: "Email",
        phone: "Phone",
        company: "Company",
        jobTitle: "Job title",
        openConversation: "Open conversation",
      };

  const fullName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ");

  const displayName =
    fullName || contact.email || copy.anonymous;

  const contactsHref = `/${locale}/dashboard/contacts`;

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={contactsHref} />}
      >
        <ArrowLeft className="size-4" />
        {copy.back}
      </Button>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <UserRound className="size-5 text-muted-foreground" />
                </span>

                <div className="min-w-0">
                  <CardTitle className="truncate text-lg">
                    {displayName}
                  </CardTitle>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateFormatter.format(contact.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ContactField
                icon={<Mail className="size-4" />}
                label={copy.email}
                value={contact.email}
              />

              <ContactField
                icon={<Phone className="size-4" />}
                label={copy.phone}
                value={contact.phone}
              />

              <ContactField
                icon={<Building2 className="size-4" />}
                label={copy.company}
                value={contact.company}
              />

              <ContactField
                icon={<BriefcaseBusiness className="size-4" />}
                label={copy.jobTitle}
                value={contact.jobTitle}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {copy.notes}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {contact.notes || copy.noNotes}
              </p>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {copy.conversations}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {contact.conversations.length} {copy.messages}
            </p>
          </div>

          {contact.conversations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex min-h-72 items-center justify-center px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {copy.noConversations}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contact.conversations.map((conversation) => {
                const latestMessage = conversation.messages[0];

                const conversationHref =
                  `/${locale}/dashboard/employees/` +
                  `${conversation.employee.id}/conversations/` +
                  conversation.id;

                return (
                  <Link
                    key={conversation.id}
                    href={conversationHref}
                    aria-label={copy.openConversation}
                    className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="transition-colors hover:border-foreground/20 hover:bg-muted/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base">
                              {conversation.title || copy.conversations}
                            </CardTitle>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {conversation.employee.name}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                              {conversation._count.messages}{" "}
                              {copy.messages}
                            </span>

                            <ArrowRight className="size-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                            <MessageSquare className="size-4 text-muted-foreground" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-muted-foreground">
                              {latestMessage?.content || copy.noMessage}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {dateFormatter.format(
                                conversation.updatedAt,
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

type ContactFieldProps = {
  icon: React.ReactNode;
  label: string;
  value: string | null;
};

function ContactField({
  icon,
  label,
  value,
}: ContactFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
import type { ContactStatus } from "@/lib/generated/prisma/client";

import { ContactPipelineBoard } from "@/features/contacts/components/contact-pipeline-board";
import { getContactsByWorkspace } from "@/features/contacts/repositories/contact.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type PipelinePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function PipelinePage({
  params,
}: PipelinePageProps) {
  const { locale } = await params;

  const workspace = await getCurrentWorkspace();

  const contacts = await getContactsByWorkspace(
    workspace.id,
  );

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Воронка продажів",
        description:
          "Перетягуйте контакти між етапами, щоб оновлювати їхній статус.",
        totalContacts: "Усього контактів",
        emptyColumn:
          "Перетягніть контакт на цей етап.",
        anonymous: "Анонімний відвідувач",
        noCompany: "Компанію не вказано",
        noEmail: "Email не вказано",
        noConversation: "Розмов ще немає",
        conversations: "розмов",
        lastActivity: "Остання активність",
        movingError:
          "Не вдалося змінити статус контакту. Спробуйте ще раз.",
        openContact: "Відкрити контакт",
        dragContact: "Перетягнути контакт",
        statuses: {
          LEAD: "Ліди",
          QUALIFIED: "Кваліфіковані",
          CUSTOMER: "Клієнти",
          CLOSED: "Закриті",
        } satisfies Record<ContactStatus, string>,
        statusDescriptions: {
          LEAD: "Нові потенційні клієнти",
          QUALIFIED:
            "Контакти з підтвердженим інтересом",
          CUSTOMER: "Активні клієнти",
          CLOSED:
            "Завершені або закриті контакти",
        } satisfies Record<ContactStatus, string>,
      }
    : {
        title: "Sales Pipeline",
        description:
          "Drag contacts between stages to update their status.",
        totalContacts: "Total contacts",
        emptyColumn:
          "Drag a contact into this stage.",
        anonymous: "Anonymous visitor",
        noCompany: "No company",
        noEmail: "No email",
        noConversation: "No conversations yet",
        conversations: "conversations",
        lastActivity: "Last activity",
        movingError:
          "Failed to update the contact status. Please try again.",
        openContact: "Open contact",
        dragContact: "Drag contact",
        statuses: {
          LEAD: "Leads",
          QUALIFIED: "Qualified",
          CUSTOMER: "Customers",
          CLOSED: "Closed",
        } satisfies Record<ContactStatus, string>,
        statusDescriptions: {
          LEAD: "New potential customers",
          QUALIFIED:
            "Contacts with confirmed interest",
          CUSTOMER: "Active customers",
          CLOSED:
            "Completed or closed contacts",
        } satisfies Record<ContactStatus, string>,
      };

  const pipelineContacts = contacts.map(
    (contact) => {
      const latestConversation =
        contact.conversations[0];

      return {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        status: contact.status,
        updatedAt: contact.updatedAt.toISOString(),
        conversationsCount:
          contact._count.conversations,
        latestConversation:
          latestConversation
            ? {
                title:
                  latestConversation.title,
                employeeName:
                  latestConversation.employee.name,
              }
            : null,
      };
    },
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {copy.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {copy.totalContacts}
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {contacts.length}
          </p>
        </div>
      </section>

      <ContactPipelineBoard
        locale={locale}
        initialContacts={pipelineContacts}
        copy={{
          emptyColumn: copy.emptyColumn,
          anonymous: copy.anonymous,
          noCompany: copy.noCompany,
          noEmail: copy.noEmail,
          noConversation:
            copy.noConversation,
          conversations:
            copy.conversations,
          lastActivity:
            copy.lastActivity,
          movingError:
            copy.movingError,
          openContact:
            copy.openContact,
          dragContact:
            copy.dragContact,
          statuses: copy.statuses,
          statusDescriptions:
            copy.statusDescriptions,
        }}
      />
    </div>
  );
}
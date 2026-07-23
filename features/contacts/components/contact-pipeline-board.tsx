"use client";

import type { ContactStatus } from "@/lib/generated/prisma/client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DragDropProvider,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import {
  Building2,
  GripVertical,
  Mail,
  MessageSquare,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateContactStatusAction } from "@/features/contacts/actions/update-contact-status";
import { cn } from "@/lib/utils";

const CONTACT_STATUSES = [
  "LEAD",
  "QUALIFIED",
  "CUSTOMER",
  "CLOSED",
] as const satisfies readonly ContactStatus[];

type PipelineContact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  company: string | null;
  status: ContactStatus;
  updatedAt: string;
  conversationsCount: number;
  latestConversation: {
    title: string | null;
    employeeName: string;
  } | null;
};

type PipelineCopy = {
  emptyColumn: string;
  anonymous: string;
  noCompany: string;
  noEmail: string;
  noConversation: string;
  conversations: string;
  lastActivity: string;
  movingError: string;
  openContact: string;
  dragContact: string;
  statuses: Record<ContactStatus, string>;
  statusDescriptions: Record<ContactStatus, string>;
};

type ContactPipelineBoardProps = {
  locale: string;
  initialContacts: PipelineContact[];
  copy: PipelineCopy;
};

type PipelineDragEndEvent = {
  canceled: boolean;
  operation: {
    source: {
      id: string | number;
    } | null;
    target: {
      id: string | number;
    } | null;
  };
};

function isContactStatus(value: string): value is ContactStatus {
  return CONTACT_STATUSES.some((status) => status === value);
}

export function ContactPipelineBoard({
  locale,
  initialContacts,
  copy,
}: ContactPipelineBoardProps) {
  const router = useRouter();

  const [contacts, setContacts] = useState(initialContacts);
  const [error, setError] = useState<string | null>(null);

  async function handleDragEnd(event: PipelineDragEndEvent) {
    if (event.canceled) {
      return;
    }

    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id;

    if (
      sourceId === undefined ||
      sourceId === null ||
      targetId === undefined ||
      targetId === null
    ) {
      return;
    }

    const contactId = String(sourceId);
    const nextStatusValue = String(targetId);

    if (!isContactStatus(nextStatusValue)) {
      return;
    }

    const contact = contacts.find((item) => item.id === contactId);

    if (!contact || contact.status === nextStatusValue) {
      return;
    }

    const previousStatus = contact.status;

    setError(null);

    setContacts((currentContacts) =>
      currentContacts.map((item) =>
        item.id === contactId
          ? {
              ...item,
              status: nextStatusValue,
            }
          : item,
      ),
    );

    const result = await updateContactStatusAction({
      contactId,
      status: nextStatusValue,
      locale,
    });

    if (!result.success) {
      setContacts((currentContacts) =>
        currentContacts.map((item) =>
          item.id === contactId
            ? {
                ...item,
                status: previousStatus,
              }
            : item,
        ),
      );

      setError(result.error || copy.movingError);

      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <DragDropProvider onDragEnd={handleDragEnd}>
        <section className="-mx-1 overflow-x-auto px-1 pb-4">
          <div className="grid min-w-[1180px] grid-cols-4 items-start gap-4">
            {CONTACT_STATUSES.map((status) => {
              const columnContacts = contacts.filter(
                (contact) => contact.status === status,
              );

              return (
                <PipelineColumn
                  key={status}
                  status={status}
                  contacts={columnContacts}
                  locale={locale}
                  copy={copy}
                />
              );
            })}
          </div>
        </section>
      </DragDropProvider>
    </div>
  );
}

type PipelineColumnProps = {
  status: ContactStatus;
  contacts: PipelineContact[];
  locale: string;
  copy: PipelineCopy;
};

function PipelineColumn({
  status,
  contacts,
  locale,
  copy,
}: PipelineColumnProps) {
  const {
    ref: droppableRef,
    isDropTarget,
  } = useDroppable({
    id: status,
  });

  const columnStyles: Record<
    ContactStatus,
    {
      indicator: string;
      count: string;
      active: string;
    }
  > = {
    LEAD: {
      indicator: "bg-blue-500",
      count:
        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      active: "border-blue-500/40 bg-blue-500/5",
    },
    QUALIFIED: {
      indicator: "bg-amber-500",
      count:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      active: "border-amber-500/40 bg-amber-500/5",
    },
    CUSTOMER: {
      indicator: "bg-emerald-500",
      count:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      active: "border-emerald-500/40 bg-emerald-500/5",
    },
    CLOSED: {
      indicator: "bg-zinc-500",
      count:
        "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
      active: "border-zinc-500/40 bg-zinc-500/5",
    },
  };

  return (
    <section
      ref={droppableRef}
      className={cn(
        "min-h-72 rounded-2xl border bg-muted/20 p-3 transition-colors",
        isDropTarget && columnStyles[status].active,
      )}
    >
      <header className="mb-3 px-1 py-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                columnStyles[status].indicator,
              )}
            />

            <h2 className="truncate text-sm font-semibold">
              {copy.statuses[status]}
            </h2>
          </div>

          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              columnStyles[status].count,
            )}
          >
            {contacts.length}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {copy.statusDescriptions[status]}
        </p>
      </header>

      {contacts.length === 0 ? (
        <div
          className={cn(
            "flex min-h-40 items-center justify-center rounded-xl border border-dashed bg-background/40 p-5 text-center transition-colors",
            isDropTarget &&
              "border-foreground/30 bg-background/70",
          )}
        >
          <p className="text-xs leading-5 text-muted-foreground">
            {copy.emptyColumn}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <PipelineContactCard
              key={contact.id}
              contact={contact}
              locale={locale}
              copy={copy}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type PipelineContactCardProps = {
  contact: PipelineContact;
  locale: string;
  copy: PipelineCopy;
};

function PipelineContactCard({
  contact,
  locale,
  copy,
}: PipelineContactCardProps) {
  const {
    ref: draggableRef,
    handleRef,
    isDragging,
  } = useDraggable({
    id: contact.id,
  });

  const fullName = [
    contact.firstName,
    contact.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const displayName =
    fullName ||
    contact.email ||
    copy.anonymous;

  const contactHref =
    `/${locale}/dashboard/contacts/${contact.id}`;

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "uk" ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <article
      ref={draggableRef}
      className={cn(
        "rounded-xl outline-none transition-opacity",
        isDragging && "z-50 opacity-50",
      )}
    >
      <Card className="gap-0 py-0 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
              <UserRound className="size-4 text-muted-foreground" />
            </span>

            <div className="min-w-0 flex-1">
              <Link
                href={contactHref}
                aria-label={copy.openContact}
                className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CardTitle className="truncate text-sm hover:underline">
                  {displayName}
                </CardTitle>
              </Link>

              <p className="mt-1 text-xs text-muted-foreground">
                {copy.lastActivity}:{" "}
                {dateFormatter.format(
                  new Date(contact.updatedAt),
                )}
              </p>
            </div>

            <button
              ref={handleRef}
              type="button"
              aria-label={copy.dragContact}
              className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" />

            <span className="truncate">
              {contact.company || copy.noCompany}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />

            <span className="truncate">
              {contact.email || copy.noEmail}
            </span>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />

              <p className="truncate text-xs font-medium">
                {contact.latestConversation?.title ||
                  copy.noConversation}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs text-muted-foreground">
                {contact.latestConversation?.employeeName ||
                  "—"}
              </p>

              <span className="shrink-0 text-xs text-muted-foreground">
                {contact.conversationsCount}{" "}
                {copy.conversations}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
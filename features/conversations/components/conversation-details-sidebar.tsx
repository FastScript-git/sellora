import {
  Bot,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ConversationHandoffCard } from "@/features/conversations/components/conversation-handoff-card";

type WorkspaceMemberOption = {
  id: string;
  role: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
};

type ConversationDetailsSidebarProps = {
  conversationId: string;
  mode: "AI" | "HUMAN";
  assignedMemberId: string | null;
  members: WorkspaceMemberOption[];
  locale: string;

  employee: {
    name: string;
    role: string;
  };

  contact: {
    company: string | null;
    email: string | null;
    phone: string | null;
    leadScore: number | null;
    sentiment:
      | "POSITIVE"
      | "NEUTRAL"
      | "NEGATIVE";
  } | null;

  contactName: string;

  copy: {
    employee: string;
    contact: string;
    leadScore: string;
    sentiment: string;
  };
};

export function ConversationDetailsSidebar({
  conversationId,
  mode,
  assignedMemberId,
  members,
  locale,
  employee,
  contact,
  contactName,
  copy,
}: ConversationDetailsSidebarProps) {
  return (
    <aside className="min-h-0 min-w-0 space-y-3 overflow-hidden border-t bg-muted/10 p-3 xl:border-l xl:border-t-0">
      <section className="shrink-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {copy.employee}
        </p>

        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Bot className="size-3.5 text-muted-foreground" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              {employee.name}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {employee.role}
            </p>
          </div>
        </div>
      </section>

      <ConversationHandoffCard
        conversationId={conversationId}
        initialMode={mode}
        initialAssignedMemberId={
          assignedMemberId
        }
        members={members}
        locale={locale}
      />

      <section className="shrink-0 border-t pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {copy.contact}
        </p>

        <div className="mt-2 flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
            <UserRound className="size-3.5 text-muted-foreground" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {contactName}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {contact?.company || "—"}
            </p>
          </div>
        </div>

        {contact ? (
          <div className="mt-2 space-y-1">
            {contact.email ? (
              <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />

                <span className="min-w-0 truncate">
                  {contact.email}
                </span>
              </div>
            ) : null}

            {contact.phone ? (
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />

                <span className="min-w-0 truncate">
                  {contact.phone}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="grid min-w-0 shrink-0 grid-cols-1 gap-2 border-t pt-3">
        <Card className="min-w-0">
          <CardContent className="flex min-w-0 items-center justify-between gap-2 px-2.5 py-2">
            <span className="min-w-0 break-words text-xs text-muted-foreground">
              {copy.leadScore}
            </span>

            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {contact?.leadScore !== null &&
              contact?.leadScore !== undefined
                ? `${contact.leadScore}/100`
                : "—"}
            </span>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="flex min-w-0 items-center justify-between gap-2 px-2.5 py-2">
            <span className="min-w-0 break-words text-xs text-muted-foreground">
              {copy.sentiment}
            </span>

            <span className="shrink-0 text-xs font-medium">
              {contact?.sentiment || "—"}
            </span>
          </CardContent>
        </Card>
      </section>
    </aside>
  );
}

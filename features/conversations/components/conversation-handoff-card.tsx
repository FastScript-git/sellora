"use client";

import {
  Bot,
  Loader2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { assignConversationMemberAction } from "@/features/conversations/actions/assign-conversation-member";
import { updateConversationModeAction } from "@/features/conversations/actions/update-conversation-mode";
import { cn } from "@/lib/utils";

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

type ConversationHandoffCardProps = {
  conversationId: string;
  initialMode: "AI" | "HUMAN";
  initialAssignedMemberId: string | null;
  members: WorkspaceMemberOption[];
  locale: string;
};

function getMemberName(
  member: WorkspaceMemberOption,
) {
  const fullName = [
    member.user.firstName,
    member.user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || member.user.email;
}

export function ConversationHandoffCard({
  conversationId,
  initialMode,
  initialAssignedMemberId,
  members,
  locale,
}: ConversationHandoffCardProps) {
  const router = useRouter();

  const [mode, setMode] =
    useState<"AI" | "HUMAN">(
      initialMode,
    );

  const [
    assignedMemberId,
    setAssignedMemberId,
  ] = useState(
    initialAssignedMemberId ?? "",
  );

  const [error, setError] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Керування розмовою",
        aiMode: "AI відповідає",
        humanMode: "Оператор відповідає",
        aiDescription:
          "ШІ-співробітник може автоматично відповідати клієнту.",
        humanDescription:
          "Автоматичні AI-відповіді вимкнені. Розмовою керує оператор.",
        switchToHuman:
          "Передати оператору",
        switchToAi:
          "Повернути AI",
        assignedTo: "Призначено",
        nobody: "Не призначено",
        saving: "Збереження...",
      }
    : {
        title: "Conversation control",
        aiMode: "AI is responding",
        humanMode: "Human is responding",
        aiDescription:
          "The AI Employee can respond to the customer automatically.",
        humanDescription:
          "Automatic AI replies are disabled. A human operator controls this conversation.",
        switchToHuman:
          "Switch to human",
        switchToAi: "Return to AI",
        assignedTo: "Assigned to",
        nobody: "Unassigned",
        saving: "Saving...",
      };

  function toggleMode() {
    if (isPending) {
      return;
    }

    const nextMode =
      mode === "AI" ? "HUMAN" : "AI";

    setError(null);

    startTransition(async () => {
      const result =
        await updateConversationModeAction({
          conversationId,
          mode: nextMode,
          locale,
        });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMode(result.mode);
      router.refresh();
    });
  }

  function handleAssignment(
    nextMemberId: string,
  ) {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        await assignConversationMemberAction({
          conversationId,
          assignedMemberId:
            nextMemberId || null,
          locale,
        });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAssignedMemberId(
        result.assignedMemberId ?? "",
      );

      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border bg-background p-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {copy.title}
      </h3>

      <div className="mt-4 rounded-xl border bg-muted/20 p-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border",
              mode === "AI"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-amber-500/30 bg-amber-500/10 text-amber-500",
            )}
          >
            {mode === "AI" ? (
              <Bot className="size-4" />
            ) : (
              <UserRound className="size-4" />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-sm font-medium">
              {mode === "AI"
                ? copy.aiMode
                : copy.humanMode}
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {mode === "AI"
                ? copy.aiDescription
                : copy.humanDescription}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={toggleMode}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : mode === "AI" ? (
            <UserRound className="size-4" />
          ) : (
            <Bot className="size-4" />
          )}

          {mode === "AI"
            ? copy.switchToHuman
            : copy.switchToAi}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        <label
          htmlFor="assigned-conversation-member"
          className="text-xs font-medium text-muted-foreground"
        >
          {copy.assignedTo}
        </label>

        <select
          id="assigned-conversation-member"
          value={assignedMemberId}
          disabled={isPending}
          onChange={(event) =>
            handleAssignment(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {copy.nobody}
          </option>

          {members.map((member) => (
            <option
              key={member.id}
              value={member.id}
            >
              {getMemberName(member)} ·{" "}
              {member.role}
            </option>
          ))}
        </select>

        {isPending ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {copy.saving}
          </p>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

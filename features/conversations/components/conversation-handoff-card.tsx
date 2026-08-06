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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignConversationMemberAction } from "@/features/conversations/actions/assign-conversation-member";
import { updateConversationModeAction } from "@/features/conversations/actions/update-conversation-mode";
import { cn } from "@/lib/utils";

const UNASSIGNED_VALUE = "__unassigned__";

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

  const selectValue =
    assignedMemberId ||
    UNASSIGNED_VALUE;

  return (
    <section className="rounded-xl border bg-background p-3">
      <h3 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {copy.title}
      </h3>

      <div className="mt-3 rounded-xl border bg-muted/20 p-3">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg border",
              mode === "AI"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-amber-500/30 bg-amber-500/10 text-amber-500",
            )}
          >
            {mode === "AI" ? (
              <Bot className="size-3.5" />
            ) : (
              <UserRound className="size-3.5" />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-xs font-medium">
              {mode === "AI"
                ? copy.aiMode
                : copy.humanMode}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
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
          className="mt-3 h-8 w-full text-xs"
          onClick={toggleMode}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : mode === "AI" ? (
            <UserRound className="size-3.5" />
          ) : (
            <Bot className="size-3.5" />
          )}

          {mode === "AI"
            ? copy.switchToHuman
            : copy.switchToAi}
        </Button>
      </div>

      <div className="mt-3 space-y-1.5">
        <label
          id="assigned-conversation-member-label"
          className="text-[11px] font-medium text-muted-foreground"
        >
          {copy.assignedTo}
        </label>

        <Select
          value={selectValue}
          disabled={isPending}
          onValueChange={(nextValue) => {
            handleAssignment(
              !nextValue ||
              nextValue ===
                UNASSIGNED_VALUE
                ? ""
                : nextValue,
            );
          }}
        >
          <SelectTrigger
            aria-labelledby="assigned-conversation-member-label"
            className="h-9 w-full bg-background px-3"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            align="start"
            sideOffset={6}
            className="min-w-[var(--anchor-width)] p-1"
          >
            <SelectItem
              value={UNASSIGNED_VALUE}
              className="min-h-9 px-2.5"
            >
              {copy.nobody}
            </SelectItem>

            {members.map((member) => (
              <SelectItem
                key={member.id}
                value={member.id}
                className="min-h-9 px-2.5"
              >
                <span className="min-w-0 truncate">
                  {getMemberName(member)}
                </span>

                <span className="shrink-0 text-xs text-muted-foreground">
                  · {member.role}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPending ? (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {copy.saving}
          </p>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 text-[11px] leading-4 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

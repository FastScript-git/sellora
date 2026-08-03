"use client";

import Link from "next/link";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  MapPin,
  MoreHorizontal,
  Phone,
  Trash2,
  UserRound,
  Video,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteMeetingAction } from "@/features/calendar/actions/delete-meeting";
import { updateMeetingStatusAction } from "@/features/calendar/actions/update-meeting-status";
import type {
  MeetingLocationType,
  MeetingStatus,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type MeetingCardProps = {
  meeting: {
    id: string;
    title: string;
    description: string | null;
    status: MeetingStatus;
    locationType: MeetingLocationType;
    locationUrl: string | null;
    locationAddress: string | null;
    phoneNumber: string | null;
    startsAt: Date;
    endsAt: Date;
    reminderAt: Date | null;
    contact: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      company: string | null;
    } | null;
    employee: {
      id: string;
      name: string;
      role: string;
    } | null;
  };
  locale: string;
};

const statusClassNames: Record<MeetingStatus, string> = {
  SCHEDULED:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  COMPLETED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CANCELED:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  NO_SHOW:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export function MeetingCard({
  meeting,
  locale,
}: MeetingCardProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(
    null,
  );

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        statuses: {
          SCHEDULED: "Заплановано",
          COMPLETED: "Завершено",
          CANCELED: "Скасовано",
          NO_SHOW: "Не з’явився",
        },
        locationTypes: {
          ONLINE: "Онлайн",
          PHONE: "Телефон",
          IN_PERSON: "Особиста зустріч",
        },
        noContact: "Без контакту",
        noEmployee: "Не призначено",
        openContact: "Відкрити контакт",
        joinMeeting: "Приєднатися",
        complete: "Позначити завершеною",
        reschedule: "Повернути у заплановані",
        cancel: "Скасувати зустріч",
        noShow: "Не з’явився",
        delete: "Видалити",
        deleteConfirm:
          "Видалити цю зустріч назавжди?",
        updateError:
          "Не вдалося змінити статус зустрічі.",
        deleteError:
          "Не вдалося видалити зустріч.",
      }
    : {
        statuses: {
          SCHEDULED: "Scheduled",
          COMPLETED: "Completed",
          CANCELED: "Canceled",
          NO_SHOW: "No show",
        },
        locationTypes: {
          ONLINE: "Online",
          PHONE: "Phone",
          IN_PERSON: "In person",
        },
        noContact: "No contact",
        noEmployee: "Unassigned",
        openContact: "Open contact",
        joinMeeting: "Join meeting",
        complete: "Mark completed",
        reschedule: "Return to scheduled",
        cancel: "Cancel meeting",
        noShow: "Mark no-show",
        delete: "Delete",
        deleteConfirm:
          "Delete this meeting permanently?",
        updateError:
          "Failed to update meeting status.",
        deleteError: "Failed to delete meeting.",
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const timeFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const contactName = meeting.contact
    ? [
        meeting.contact.firstName,
        meeting.contact.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      meeting.contact.email ||
      copy.noContact
    : copy.noContact;

  const LocationIcon =
    meeting.locationType === "ONLINE"
      ? Video
      : meeting.locationType === "PHONE"
        ? Phone
        : MapPin;

  async function changeStatus(
    status: MeetingStatus,
  ): Promise<void> {
    setError(null);

    startTransition(async () => {
      const result =
        await updateMeetingStatusAction({
          meetingId: meeting.id,
          status,
          locale,
        });

      if (!result.success) {
        setError(
          result.error ?? copy.updateError,
        );
        return;
      }

      router.refresh();
    });
  }

  async function deleteMeeting(): Promise<void> {
    const confirmed = window.confirm(
      copy.deleteConfirm,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteMeetingAction({
        meetingId: meeting.id,
        locale,
      });

      if (!result.success) {
        setError(
          result.error ?? copy.deleteError,
        );
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <CalendarClock className="size-5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={cn(
                    "font-semibold",
                    meeting.status === "CANCELED" &&
                      "text-muted-foreground line-through",
                  )}
                >
                  {meeting.title}
                </h2>

                <Badge
                  variant="outline"
                  className={
                    statusClassNames[
                      meeting.status
                    ]
                  }
                >
                  {copy.statuses[meeting.status]}
                </Badge>
              </div>

              {meeting.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {meeting.description}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" />

                  {dateFormatter.format(
                    meeting.startsAt,
                  )}{" "}
                  –{" "}
                  {timeFormatter.format(
                    meeting.endsAt,
                  )}
                </span>

                <span className="inline-flex items-center gap-2">
                  <LocationIcon className="size-4" />

                  {
                    copy.locationTypes[
                      meeting.locationType
                    ]
                  }
                </span>

                {meeting.contact ? (
                  <Link
                    href={`/${locale}/dashboard/contacts/${meeting.contact.id}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <UserRound className="size-4" />
                    {contactName}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="size-4" />
                    {copy.noContact}
                  </span>
                )}

                <span className="inline-flex items-center gap-2">
                  <Bot className="size-4" />
                  {meeting.employee?.name ||
                    copy.noEmployee}
                </span>
              </div>

              {meeting.locationType ===
                "IN_PERSON" &&
              meeting.locationAddress ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {meeting.locationAddress}
                </p>
              ) : null}

              {meeting.locationType === "PHONE" &&
              meeting.phoneNumber ? (
                <a
                  href={`tel:${meeting.phoneNumber}`}
                  className="mt-3 inline-flex text-sm text-primary hover:underline"
                >
                  {meeting.phoneNumber}
                </a>
              ) : null}

              {error ? (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {meeting.locationType === "ONLINE" &&
            meeting.locationUrl ? (
              <a
                href={meeting.locationUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-muted",
                )}
              >
                <ExternalLink className="size-4" />
                {copy.joinMeeting}
              </a>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      isPending || isDeleting
                    }
                    aria-label="Meeting actions"
                  >
                    {isPending || isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="size-4" />
                    )}
                  </Button>
                }
              />

              <DropdownMenuContent align="end">
                {meeting.status !== "COMPLETED" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      void changeStatus("COMPLETED")
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    {copy.complete}
                  </DropdownMenuItem>
                ) : null}

                {meeting.status !== "SCHEDULED" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      void changeStatus("SCHEDULED")
                    }
                  >
                    <CalendarClock className="size-4" />
                    {copy.reschedule}
                  </DropdownMenuItem>
                ) : null}

                {meeting.status !== "NO_SHOW" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      void changeStatus("NO_SHOW")
                    }
                  >
                    <UserRound className="size-4" />
                    {copy.noShow}
                  </DropdownMenuItem>
                ) : null}

                {meeting.status !== "CANCELED" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      void changeStatus("CANCELED")
                    }
                  >
                    <XCircle className="size-4" />
                    {copy.cancel}
                  </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    void deleteMeeting()
                  }
                >
                  <Trash2 className="size-4" />
                  {copy.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

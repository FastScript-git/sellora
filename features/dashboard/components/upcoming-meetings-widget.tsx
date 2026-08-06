import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  Clock3,
  MapPin,
  Phone,
  UserRound,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
} from "@/components/ui/button";
import {
  DashboardWidget,
  DashboardWidgetEmptyState,
} from "@/features/dashboard/components/dashboard-widget";
import type {
  MeetingLocationType,
  MeetingStatus,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

type UpcomingMeeting = {
  id: string;
  title: string;
  status: MeetingStatus;
  locationType: MeetingLocationType;
  locationUrl: string | null;
  locationAddress: string | null;
  phoneNumber: string | null;
  startsAt: Date;
  endsAt: Date;

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

type UpcomingMeetingsWidgetProps = {
  meetings: UpcomingMeeting[];
  locale: string;
};

export function UpcomingMeetingsWidget({
  meetings,
  locale,
}: UpcomingMeetingsWidgetProps) {
  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Майбутні зустрічі",
        description:
          "Найближчі дзвінки та демонстрації.",
        viewAll: "Календар",
        emptyTitle:
          "Майбутніх зустрічей немає",
        emptyDescription:
          "Заплануйте дзвінок або демонстрацію.",
        noContact: "Без контакту",
        noEmployee: "Не призначено",
        locationTypes: {
          ONLINE: "Онлайн",
          PHONE: "Телефон",
          IN_PERSON: "Особисто",
        },
      }
    : {
        title: "Upcoming meetings",
        description:
          "Your next calls and product demos.",
        viewAll: "Calendar",
        emptyTitle:
          "No upcoming meetings",
        emptyDescription:
          "Schedule a call or product demo.",
        noContact: "No contact",
        noEmployee: "Unassigned",
        locationTypes: {
          ONLINE: "Online",
          PHONE: "Phone",
          IN_PERSON: "In person",
        },
      };

  const dateFormatter =
    new Intl.DateTimeFormat(
      isUkrainian
        ? "uk-UA"
        : "en-US",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      },
    );

  const timeFormatter =
    new Intl.DateTimeFormat(
      isUkrainian
        ? "uk-UA"
        : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  const visibleMeetings =
    meetings.slice(0, 4);

  const calendarHref =
    `/${locale}/dashboard/calendar`;

  return (
    <DashboardWidget
      title={copy.title}
      description={copy.description}
      icon={CalendarClock}
      action={
        <Link
          href={calendarHref}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "h-8 w-full justify-center gap-1.5 px-2 text-xs sm:w-auto",
          )}
        >
          {copy.viewAll}

          <ArrowRight className="size-3.5" />
        </Link>
      }
    >
      {visibleMeetings.length === 0 ? (
        <DashboardWidgetEmptyState
          icon={CalendarClock}
          title={copy.emptyTitle}
          description={
            copy.emptyDescription
          }
        />
      ) : (
        <div className="divide-y">
          {visibleMeetings.map(
            (meeting) => {
              const contactName =
                meeting.contact
                  ? [
                      meeting.contact
                        .firstName,
                      meeting.contact
                        .lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    meeting.contact.email ||
                    copy.noContact
                  : copy.noContact;

              const LocationIcon =
                meeting.locationType ===
                "ONLINE"
                  ? Video
                  : meeting.locationType ===
                      "PHONE"
                    ? Phone
                    : MapPin;

              return (
                <Link
                  key={meeting.id}
                  href={calendarHref}
                  className="group flex min-w-0 items-start gap-3 px-4 py-4 outline-none transition-colors hover:bg-muted/25 focus-visible:bg-muted/25 sm:px-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                    <CalendarClock className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="min-w-0 truncate text-sm font-semibold">
                            {meeting.title}
                          </p>

                          <Badge
                            variant="outline"
                            className="h-5 shrink-0 px-1.5 text-[10px]"
                          >
                            <LocationIcon className="mr-1 size-3" />

                            {
                              copy
                                .locationTypes[
                                meeting
                                  .locationType
                              ]
                            }
                          </Badge>
                        </div>

                        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex shrink-0 items-center gap-1">
                            <Clock3 className="size-3" />

                            {dateFormatter.format(
                              meeting.startsAt,
                            )}

                            {", "}

                            {timeFormatter.format(
                              meeting.startsAt,
                            )}
                          </span>

                          <span
                            aria-hidden="true"
                            className="hidden sm:inline"
                          >
                            ·
                          </span>

                          <span className="inline-flex min-w-0 items-center gap-1">
                            <UserRound className="size-3 shrink-0" />

                            <span className="truncate">
                              {contactName}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <Bot className="size-3 shrink-0" />

                        <span className="truncate">
                          {meeting.employee
                            ?.name ||
                            copy.noEmployee}
                        </span>
                      </span>

                      {meeting.contact
                        ?.company ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="hidden sm:inline"
                          >
                            ·
                          </span>

                          <span className="truncate">
                            {
                              meeting.contact
                                .company
                            }
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              );
            },
          )}
        </div>
      )}
    </DashboardWidget>
  );
}

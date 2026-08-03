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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  MeetingLocationType,
  MeetingStatus,
} from "@/lib/generated/prisma/client";

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
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Майбутні зустрічі",
        description: "Найближчі дзвінки та демонстрації.",
        viewAll: "Календар",
        emptyTitle: "Майбутніх зустрічей немає",
        emptyDescription: "Заплануйте дзвінок або демонстрацію.",
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
        description: "Your next calls and product demos.",
        viewAll: "Calendar",
        emptyTitle: "No upcoming meetings",
        emptyDescription: "Schedule a call or product demo.",
        noContact: "No contact",
        noEmployee: "Unassigned",
        locationTypes: {
          ONLINE: "Online",
          PHONE: "Phone",
          IN_PERSON: "In person",
        },
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    },
  );

  const timeFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const visibleMeetings = meetings.slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{copy.title}</CardTitle>

            <CardDescription className="mt-1">
              {copy.description}
            </CardDescription>
          </div>

          <Link
            href={`/${locale}/dashboard/calendar`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {copy.viewAll}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {visibleMeetings.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-7 text-center">
            <CalendarClock className="size-4 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              {copy.emptyTitle}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            {visibleMeetings.map((meeting) => {
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

              return (
                <Link
                  key={meeting.id}
                  href={`/${locale}/dashboard/calendar`}
                  className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                    <CalendarClock className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {meeting.title}
                      </p>

                      <Badge
                        variant="outline"
                        className="h-5 shrink-0 px-1.5 text-[10px]"
                      >
                        <LocationIcon className="mr-1 size-3" />
                        {
                          copy.locationTypes[
                            meeting.locationType
                          ]
                        }
                      </Badge>
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <Clock3 className="size-3" />
                        {dateFormatter.format(meeting.startsAt)}
                        ,{" "}
                        {timeFormatter.format(meeting.startsAt)}
                      </span>

                      <span aria-hidden="true">·</span>

                      <span className="inline-flex min-w-0 items-center gap-1">
                        <UserRound className="size-3 shrink-0" />

                        <span className="truncate">
                          {contactName}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <Bot className="size-3 shrink-0" />

                        <span className="truncate">
                          {meeting.employee?.name ||
                            copy.noEmployee}
                        </span>
                      </span>

                      {meeting.contact?.company ? (
                        <>
                          <span aria-hidden="true">·</span>

                          <span className="truncate">
                            {meeting.contact.company}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

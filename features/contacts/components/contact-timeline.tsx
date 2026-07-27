import {
  Activity,
  Building2,
  BriefcaseBusiness,
  CalendarClock,
  Mail,
  MessageSquareText,
  Phone,
  Sparkles,
  Tags,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ContactTimelineItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: Date;
};

type ContactTimelineProps = {
  timeline: ContactTimelineItem[];
  locale: string;
};

export function ContactTimeline({
  timeline,
  locale,
}: ContactTimelineProps) {
  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        title: "Хронологія",
        description:
          "Автоматично зафіксовані зміни та AI-події контакту.",
        emptyTitle: "Подій поки немає",
        emptyDescription:
          "Нові AI-дії та зміни контакту з’являться тут автоматично.",
      }
    : {
        title: "Timeline",
        description:
          "Automatically recorded contact changes and AI events.",
        emptyTitle: "No events yet",
        emptyDescription:
          "New AI actions and contact changes will appear here automatically.",
      };

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              {copy.title}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {copy.description}
            </p>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Activity className="size-4 text-muted-foreground" />
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {timeline.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/40">
              <CalendarClock className="size-5 text-muted-foreground" />
            </span>

            <p className="mt-4 text-sm font-medium">
              {copy.emptyTitle}
            </p>

            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute bottom-4 left-5 top-4 w-px bg-border"
            />

            <div className="space-y-1">
              {timeline.map((event) => {
                const icon = getTimelineIcon(
                  event.type,
                  event.title,
                );

                return (
                  <article
                    key={event.id}
                    className="relative flex gap-4 rounded-xl px-1 py-3"
                  >
                    <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-muted-foreground shadow-sm">
                      {icon}
                    </span>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <h3 className="text-sm font-medium leading-5">
                          {event.title}
                        </h3>

                        <time
                          dateTime={event.createdAt.toISOString()}
                          className="shrink-0 text-xs text-muted-foreground"
                        >
                          {dateFormatter.format(
                            event.createdAt,
                          )}
                        </time>
                      </div>

                      {event.description ? (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTimelineIcon(
  type: string,
  title: string,
) {
  const normalizedValue =
    `${type} ${title}`.toLowerCase();

  if (
    normalizedValue.includes("email")
  ) {
    return <Mail className="size-4" />;
  }

  if (
    normalizedValue.includes("phone")
  ) {
    return <Phone className="size-4" />;
  }

  if (
    normalizedValue.includes("company")
  ) {
    return <Building2 className="size-4" />;
  }

  if (
    normalizedValue.includes("job") ||
    normalizedValue.includes("position") ||
    normalizedValue.includes("посад")
  ) {
    return (
      <BriefcaseBusiness className="size-4" />
    );
  }

  if (
    normalizedValue.includes("name") ||
    normalizedValue.includes("contact created")
  ) {
    return <UserRound className="size-4" />;
  }

  if (
    normalizedValue.includes("lead_score") ||
    normalizedValue.includes("lead score")
  ) {
    return <TrendingUp className="size-4" />;
  }

  if (
    normalizedValue.includes("summary")
  ) {
    return (
      <MessageSquareText className="size-4" />
    );
  }

  if (
    normalizedValue.includes("tag")
  ) {
    return <Tags className="size-4" />;
  }

  if (
    normalizedValue.includes("ai")
  ) {
    return <Sparkles className="size-4" />;
  }

  return <Activity className="size-4" />;
}
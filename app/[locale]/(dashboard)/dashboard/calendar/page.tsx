export const dynamic = "force-dynamic";

import {
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/shared/empty-state";
import {
  PageHeader,
  PageHeaderStat,
} from "@/components/dashboard/shared/page-header";
import { CreateMeetingDialog } from "@/features/calendar/components/create-meeting-dialog";
import { MeetingCard } from "@/features/calendar/components/meeting-card";
import {
  getMeetingContactOptions,
  getMeetingEmployeeOptions,
  getMeetingsByWorkspace,
} from "@/features/calendar/repositories/meeting.repository";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type CalendarPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CalendarPage({
  params,
}: CalendarPageProps) {
  const { locale } = await params;

  const workspace = await getCurrentWorkspace();

  const [meetings, contacts, employees] =
    await Promise.all([
      getMeetingsByWorkspace({
        workspaceId: workspace.id,
      }),
      getMeetingContactOptions(workspace.id),
      getMeetingEmployeeOptions(workspace.id),
    ]);

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Продажі",
        title: "Календар",
        description:
          "Плануйте дзвінки, демонстрації та зустрічі з клієнтами.",
        all: "Усі зустрічі",
        upcoming: "Майбутні",
        completed: "Завершені",
        canceled: "Скасовані",
        emptyTitle: "Зустрічей поки немає",
        emptyDescription:
          "Створіть першу зустріч із клієнтом або заплануйте демонстрацію продукту.",
        upcomingTitle: "Майбутні зустрічі",
        pastTitle: "Минулі та завершені",
      }
    : {
        eyebrow: "Sales",
        title: "Calendar",
        description:
          "Schedule customer calls, product demos and meetings.",
        all: "All meetings",
        upcoming: "Upcoming",
        completed: "Completed",
        canceled: "Canceled",
        emptyTitle: "No meetings yet",
        emptyDescription:
          "Create your first customer meeting or schedule a product demo.",
        upcomingTitle: "Upcoming meetings",
        pastTitle: "Past and completed",
      };

  const now = new Date();

  const upcomingMeetings = meetings.filter(
    (meeting) =>
      meeting.status === "SCHEDULED" &&
      meeting.startsAt >= now,
  );

  const completedMeetings = meetings.filter(
    (meeting) =>
      meeting.status === "COMPLETED",
  );

  const canceledMeetings = meetings.filter(
    (meeting) =>
      meeting.status === "CANCELED" ||
      meeting.status === "NO_SHOW",
  );

  const otherMeetings = meetings.filter(
    (meeting) =>
      !upcomingMeetings.some(
        (upcoming) =>
          upcoming.id === meeting.id,
      ),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        stats={
          <>
            <PageHeaderStat
              label={copy.all}
              value={meetings.length}
            />

            <PageHeaderStat
              label={copy.upcoming}
              value={upcomingMeetings.length}
            />

            <PageHeaderStat
              label={copy.completed}
              value={completedMeetings.length}
            />

            <PageHeaderStat
              label={copy.canceled}
              value={canceledMeetings.length}
            />
          </>
        }
        actions={
          <CreateMeetingDialog
            locale={locale}
            contacts={contacts}
            employees={employees}
          />
        }
      />

      {meetings.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                <Clock3 className="size-4 text-muted-foreground" />
              </span>

              <div>
                <h2 className="font-semibold">
                  {copy.upcomingTitle}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {upcomingMeetings.length}
                </p>
              </div>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
                <CalendarDays className="mx-auto size-6 text-muted-foreground" />

                <p className="mt-3 text-sm text-muted-foreground">
                  {copy.emptyTitle}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map(
                  (meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      locale={locale}
                    />
                  ),
                )}
              </div>
            )}
          </section>

          {otherMeetings.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                  <CheckCircle2 className="size-4 text-muted-foreground" />
                </span>

                <div>
                  <h2 className="font-semibold">
                    {copy.pastTitle}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {otherMeetings.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {otherMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

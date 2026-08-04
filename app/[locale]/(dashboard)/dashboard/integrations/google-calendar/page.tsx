import Link from "next/link";
import {
  CalendarCheck2,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTestCalendarEventAction } from "@/features/integrations/google-calendar/actions/create-test-calendar-event";

type GoogleCalendarTestPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    status?: string;
    error?: string;
    eventUrl?: string;
  }>;
};

export default async function GoogleCalendarTestPage({
  params,
  searchParams,
}: GoogleCalendarTestPageProps) {
  const { locale } = await params;
  const query = await searchParams;

  const isUkrainian =
    locale === "uk";

  const copy = isUkrainian
    ? {
        eyebrow: "Інтеграції",
        title: "Google Calendar",
        description:
          "Перевірте, чи Sellora може створювати події у вашому Google Calendar.",
        security:
          "OAuth-токен отримується на сервері через Clerk і не передається браузеру.",
        cardTitle:
          "Тест підключення",
        cardDescription:
          "Sellora створить тестову подію тривалістю 30 хвилин, яка почнеться приблизно через 5 хвилин.",
        button:
          "Створити тестову подію",
        success:
          "Подію успішно створено у Google Calendar.",
        openEvent:
          "Відкрити подію",
        error:
          "Не вдалося створити подію.",
        reconnect:
          "Вийдіть із Sellora та повторно увійдіть через Google, підтвердивши доступ до Calendar.",
      }
    : {
        eyebrow: "Integrations",
        title: "Google Calendar",
        description:
          "Verify that Sellora can create events in your Google Calendar.",
        security:
          "The OAuth token is retrieved server-side through Clerk and is never exposed to the browser.",
        cardTitle:
          "Connection test",
        cardDescription:
          "Sellora will create a 30-minute test event starting in approximately five minutes.",
        button:
          "Create test event",
        success:
          "The event was created successfully in Google Calendar.",
        openEvent:
          "Open event",
        error:
          "The event could not be created.",
        reconnect:
          "Sign out of Sellora and sign in again with Google, then approve Calendar access.",
      };

  const succeeded =
    query.status === "success";

  const failed =
    query.status === "error";

  return (
    <div className="mx-auto min-w-0 max-w-3xl space-y-6">
      <PageHeader
        icon={CalendarCheck2}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {copy.security}
          </PageHeaderNote>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {copy.cardTitle}
          </CardTitle>

          <CardDescription>
            {copy.cardDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {succeeded ? (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400"
            >
              <p className="font-medium">
                {copy.success}
              </p>

              {query.eventUrl ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={query.eventUrl}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ExternalLink className="size-4" />
                  {copy.openEvent}
                </Button>
              ) : null}
            </div>
          ) : null}

          {failed ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <p className="font-medium">
                {copy.error}
              </p>

              <p className="mt-2 break-words text-xs leading-5">
                {query.error}
              </p>

              <p className="mt-3 text-xs leading-5">
                {copy.reconnect}
              </p>
            </div>
          ) : null}

          <form
            action={
              createTestCalendarEventAction
            }
          >
            <input
              type="hidden"
              name="locale"
              value={
                isUkrainian
                  ? "uk"
                  : "en"
              }
            />

            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              <LoaderCircle className="size-4" />
              {copy.button}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

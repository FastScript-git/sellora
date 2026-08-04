import Link from "next/link";
import {
  Bot,
  Plus,
  Search,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAIEmployees } from "@/features/ai-employees/queries";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type AIEmployeesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AIEmployeesPage({
  params,
}: AIEmployeesPageProps) {
  const { locale } = await params;

  const t = await getTranslations(
    "aiEmployees",
  );

  const workspace =
    await getCurrentWorkspace();

  const employees =
    await getAIEmployees({
      workspaceId: workspace.id,
    });

  const createHref =
    `/${locale}/dashboard/employees/new`;

  const dateFormatter =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    });

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={
              <Link href={createHref} />
            }
          >
            <Plus className="size-4" />
            {t("create")}
          </Button>
        }
      />

      <section
        aria-label={t("searchPlaceholder")}
        className="flex min-w-0 flex-col gap-3 sm:flex-row"
      >
        <div className="relative w-full min-w-0 max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            placeholder={t(
              "searchPlaceholder",
            )}
            aria-label={t(
              "searchPlaceholder",
            )}
            className="min-w-0 pl-9"
          />
        </div>
      </section>

      {employees.length === 0 ? (
        <Card className="min-w-0 border-dashed">
          <CardContent className="flex min-h-80 flex-col items-center justify-center px-5 py-12 text-center sm:min-h-96 sm:px-6 sm:py-16">
            <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/50">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <h2 className="mt-5 text-lg font-semibold">
              {t("emptyTitle")}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("emptyDescription")}
            </p>

            <Button
              className="mt-6 w-full sm:w-auto"
              nativeButton={false}
              render={
                <Link href={createHref} />
              }
            >
              <Plus className="size-4" />
              {t("createFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section
          aria-label={t("title")}
          className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {employees.map((employee) => {
            const employeeHref =
              `/${locale}/dashboard/employees/${employee.id}`;

            return (
              <Link
                key={employee.id}
                href={employeeHref}
                className="group min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full min-w-0 transition-colors group-hover:border-foreground/20 group-hover:bg-muted/20">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 transition-colors group-hover:bg-muted">
                        <Bot className="size-5 text-muted-foreground" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold">
                          {employee.name}
                        </h2>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {employee.role}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium">
                        {employee.status}
                      </span>
                    </div>

                    {employee.description ? (
                      <p className="mt-5 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
                        {employee.description}
                      </p>
                    ) : null}

                    <div className="mt-6 flex min-w-0 items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
                      <span className="truncate">
                        {employee.language}
                      </span>

                      <time
                        className="shrink-0"
                        dateTime={employee.updatedAt.toISOString()}
                      >
                        {dateFormatter.format(
                          employee.updatedAt,
                        )}
                      </time>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
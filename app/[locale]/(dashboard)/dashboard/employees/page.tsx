import Link from "next/link";
import { Bot, Plus, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const t = await getTranslations("aiEmployees");

  const workspace = await getCurrentWorkspace();

  const employees = await getAIEmployees({
    workspaceId: workspace.id,
  });

  const createHref = `/${locale}/dashboard/employees/new`;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button nativeButton={false} render={<Link href={createHref} />}>
          <Plus className="size-4" />
          {t("create")}
        </Button>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </section>

      {employees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-96 flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/50">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <h3 className="mt-5 text-lg font-semibold">
              {t("emptyTitle")}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("emptyDescription")}
            </p>

            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href={createHref} />}
            >
              <Plus className="size-4" />
              {t("createFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section
          aria-label={t("title")}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {employees.map((employee) => {
            const employeeHref = `/${locale}/dashboard/employees/${employee.id}`;

            return (
              <Link
                key={employee.id}
                href={employeeHref}
                className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-colors group-hover:border-foreground/20 group-hover:bg-muted/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 transition-colors group-hover:bg-muted">
                        <Bot className="size-5 text-muted-foreground" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">
                          {employee.name}
                        </h3>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {employee.role}
                        </p>
                      </div>

                      <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                        {employee.status}
                      </span>
                    </div>

                    {employee.description ? (
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {employee.description}
                      </p>
                    ) : null}

                    <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                      <span>{employee.language}</span>

                      <time dateTime={employee.updatedAt.toISOString()}>
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                        }).format(employee.updatedAt)}
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
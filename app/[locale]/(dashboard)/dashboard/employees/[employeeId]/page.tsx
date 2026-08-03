import {
  CalendarDays,
  Languages,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type AIEmployeeOverviewPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function AIEmployeeOverviewPage({
  params,
}: AIEmployeeOverviewPageProps) {
  const { locale, employeeId } =
    await params;

  const [t, workspace] =
    await Promise.all([
      getTranslations({
        locale,
        namespace: "aiEmployeeDetails",
      }),
      getCurrentWorkspace(),
    ]);

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  const dateFormatter =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    });

  const configurationItems = [
    {
      key: "language",
      label: t(
        "configuration.language",
      ),
      value: employee.language,
      icon: Languages,
    },
    {
      key: "tone",
      label: t("configuration.tone"),
      value:
        employee.tone ||
        t("configuration.notSet"),
      icon: MessageSquareText,
    },
    {
      key: "created",
      label: t(
        "configuration.created",
      ),
      value: dateFormatter.format(
        employee.createdAt,
      ),
      icon: CalendarDays,
    },
    {
      key: "updated",
      label: t(
        "configuration.updated",
      ),
      value: dateFormatter.format(
        employee.updatedAt,
      ),
      icon: RefreshCw,
    },
  ];

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.5fr)_360px]">
      <Card className="min-w-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("overview.title")}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="min-h-32 rounded-xl border bg-muted/10 p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {employee.description ||
                t(
                  "overview.noDescription",
                )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("configuration.title")}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {configurationItems.map(
              (item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="flex min-w-0 flex-col gap-3 rounded-xl border bg-muted/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-center xl:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </span>

                      <span className="min-w-0 break-words text-xs leading-5 text-muted-foreground">
                        {item.label}
                      </span>
                    </div>

                    <span className="break-words text-sm font-medium capitalize sm:max-w-[52%] sm:text-right lg:max-w-none lg:text-left xl:max-w-[52%] xl:text-right">
                      {item.value}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

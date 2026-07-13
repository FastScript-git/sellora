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
  const { locale, employeeId } = await params;

  const t = await getTranslations("aiEmployeeDetails");
  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("overview.title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            {employee.description || t("overview.noDescription")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("configuration.title")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">
              {t("configuration.language")}
            </span>

            <span className="font-medium">
              {employee.language}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">
              {t("configuration.tone")}
            </span>

            <span className="font-medium capitalize">
              {employee.tone || t("configuration.notSet")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">
              {t("configuration.created")}
            </span>

            <time
              dateTime={employee.createdAt.toISOString()}
              className="font-medium"
            >
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
              }).format(employee.createdAt)}
            </time>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">
              {t("configuration.updated")}
            </span>

            <time
              dateTime={employee.updatedAt.toISOString()}
              className="font-medium"
            >
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
              }).format(employee.updatedAt)}
            </time>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
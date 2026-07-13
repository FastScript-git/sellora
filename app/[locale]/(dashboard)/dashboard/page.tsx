import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  const metrics = [
    {
      key: "aiEmployees",
      title: t("metrics.aiEmployees.title"),
      value: t("metrics.aiEmployees.value"),
      description: t("metrics.aiEmployees.description"),
    },
    {
      key: "conversations",
      title: t("metrics.conversations.title"),
      value: t("metrics.conversations.value"),
      description: t("metrics.conversations.description"),
    },
    {
      key: "resolutionRate",
      title: t("metrics.resolutionRate.title"),
      value: t("metrics.resolutionRate.value"),
      description: t("metrics.resolutionRate.description"),
    },
    {
      key: "knowledgeSources",
      title: t("metrics.knowledgeSources.title"),
      value: t("metrics.knowledgeSources.value"),
      description: t("metrics.knowledgeSources.description"),
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-primary">
          {t("overview")}
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          {t("welcome")}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("description")}
        </p>
      </section>

      <section
        aria-label={t("overview")}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {metric.value}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
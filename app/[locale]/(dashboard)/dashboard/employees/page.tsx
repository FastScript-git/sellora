import { Bot, Plus, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AIEmployeesPage() {
  const t = await getTranslations("aiEmployees");

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

        <Button>
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

          <Button className="mt-6">
            <Plus className="size-4" />
            {t("createFirst")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
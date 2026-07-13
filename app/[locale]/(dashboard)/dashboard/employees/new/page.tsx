import Link from "next/link";
import { ArrowLeft, Bot, Save } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type NewAIEmployeePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NewAIEmployeePage({
  params,
}: NewAIEmployeePageProps) {
  const { locale } = await params;
  const t = await getTranslations("aiEmployeeCreate");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <section>
        <Link
          href={`/${locale}/dashboard/employees`}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
            <Bot className="size-5 text-muted-foreground" />
          </span>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              {t("title")}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
      </section>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInformation.title")}</CardTitle>
            <CardDescription>
              {t("basicInformation.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("fields.name.label")}</Label>

              <Input
                id="name"
                name="name"
                placeholder={t("fields.name.placeholder")}
                autoComplete="off"
              />

              <p className="text-xs text-muted-foreground">
                {t("fields.name.hint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">{t("fields.role.label")}</Label>

              <Input
                id="role"
                name="role"
                placeholder={t("fields.role.placeholder")}
                autoComplete="off"
              />

              <p className="text-xs text-muted-foreground">
                {t("fields.role.hint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                {t("fields.description.label")}
              </Label>

              <Textarea
                id="description"
                name="description"
                placeholder={t("fields.description.placeholder")}
                rows={5}
              />

              <p className="text-xs text-muted-foreground">
                {t("fields.description.hint")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("communication.title")}</CardTitle>
            <CardDescription>
              {t("communication.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="language">{t("fields.language.label")}</Label>

              <select
                id="language"
                name="language"
                defaultValue={locale === "uk" ? "UK" : "EN"}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="EN">{t("fields.language.english")}</option>
                <option value="UK">{t("fields.language.ukrainian")}</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tone">{t("fields.tone.label")}</Label>

              <select
                id="tone"
                name="tone"
                defaultValue="professional"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="professional">
                  {t("fields.tone.professional")}
                </option>
                <option value="friendly">{t("fields.tone.friendly")}</option>
                <option value="concise">{t("fields.tone.concise")}</option>
                <option value="empathetic">
                  {t("fields.tone.empathetic")}
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/${locale}/dashboard/employees`}
            className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("cancel")}
          </Link>

          <Button type="submit">
            <Save className="size-4" />
            {t("createDraft")}
          </Button>
        </div>
      </form>
    </div>
  );
}
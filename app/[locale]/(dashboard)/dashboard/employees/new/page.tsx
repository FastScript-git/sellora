import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CreateAIEmployeeForm } from "@/features/ai-employees/components/create-ai-employee-form";

type NewAIEmployeePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NewAIEmployeePage({
  params,
}: NewAIEmployeePageProps) {
  const { locale } = await params;

  const t = await getTranslations(
    "aiEmployeeCreate",
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href={`/${locale}/dashboard/employees`}
        className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b bg-muted/10 px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="size-3.5" />
                Sellora AI
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("title")}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t("description")}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <CreateAIEmployeeForm
            locale={locale}
            translations={{
              nameLabel: t("fields.name.label"),
              namePlaceholder: t(
                "fields.name.placeholder",
              ),
              nameHint: t("fields.name.hint"),
              roleLabel: t("fields.role.label"),
              rolePlaceholder: t(
                "fields.role.placeholder",
              ),
              roleHint: t("fields.role.hint"),
              cancel: t("cancel"),
              createDraft: t("createDraft"),
              creating: t("creating"),
            }}
          />
        </div>
      </section>
    </div>
  );
}

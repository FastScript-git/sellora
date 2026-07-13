import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
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

      <CreateAIEmployeeForm
        locale={locale}
        translations={{
          basicInformationTitle: t("basicInformation.title"),
          basicInformationDescription: t("basicInformation.description"),
          communicationTitle: t("communication.title"),
          communicationDescription: t("communication.description"),
          nameLabel: t("fields.name.label"),
          namePlaceholder: t("fields.name.placeholder"),
          nameHint: t("fields.name.hint"),
          roleLabel: t("fields.role.label"),
          rolePlaceholder: t("fields.role.placeholder"),
          roleHint: t("fields.role.hint"),
          descriptionLabel: t("fields.description.label"),
          descriptionPlaceholder: t("fields.description.placeholder"),
          descriptionHint: t("fields.description.hint"),
          languageLabel: t("fields.language.label"),
          english: t("fields.language.english"),
          ukrainian: t("fields.language.ukrainian"),
          toneLabel: t("fields.tone.label"),
          professional: t("fields.tone.professional"),
          friendly: t("fields.tone.friendly"),
          concise: t("fields.tone.concise"),
          empathetic: t("fields.tone.empathetic"),
          cancel: t("cancel"),
          createDraft: t("createDraft"),
          creating: t("creating"),
        }}
      />
    </div>
  );
}
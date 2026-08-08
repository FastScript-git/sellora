import {
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  PageHeader,
  PageHeaderNote,
} from "@/components/dashboard/shared/page-header";
import { InstructionsForm } from "@/features/ai-employees/components/instructions-form";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type InstructionsPageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function InstructionsPage({
  params,
}: InstructionsPageProps) {
  const { locale, employeeId } =
    await params;

  const t = await getTranslations(
    "aiEmployeeInstructions",
  );

  const workspace =
    await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        compact
        icon={SlidersHorizontal}
        title={t("title")}
        description={t("description")}
        aside={
          <PageHeaderNote
            icon={ShieldCheck}
            tone="success"
          >
            {locale === "uk"
              ? "Інструкції застосовуються лише до цього ШІ-співробітника."
              : "These instructions apply only to this AI Employee."}
          </PageHeaderNote>
        }
      />

      <InstructionsForm
        employeeId={employee.id}
        locale={locale}
        initialValues={{
          language: employee.language,
          tone: employee.tone ?? "",
          identity: employee.identity ?? "",
          goals: employee.goals ?? "",
          rules: employee.rules ?? "",
          responseStyle:
            employee.responseStyle ?? "",
          restrictions:
            employee.restrictions ?? "",
        }}
        translations={{
          identity: {
            title: t("identity.title"),
            description: t(
              "identity.description",
            ),
            label: t("identity.label"),
            placeholder: t(
              "identity.placeholder",
            ),
            hint: t("identity.hint"),
          },
          goals: {
            title: t("goals.title"),
            description: t(
              "goals.description",
            ),
            label: t("goals.label"),
            placeholder: t(
              "goals.placeholder",
            ),
            hint: t("goals.hint"),
          },
          rules: {
            title: t("rules.title"),
            description: t(
              "rules.description",
            ),
            label: t("rules.label"),
            placeholder: t(
              "rules.placeholder",
            ),
            hint: t("rules.hint"),
          },
          responseStyle: {
            title: t(
              "responseStyle.title",
            ),
            description: t(
              "responseStyle.description",
            ),
            label: t(
              "responseStyle.label",
            ),
            placeholder: t(
              "responseStyle.placeholder",
            ),
            hint: t(
              "responseStyle.hint",
            ),
          },
          restrictions: {
            title: t(
              "restrictions.title",
            ),
            description: t(
              "restrictions.description",
            ),
            label: t(
              "restrictions.label",
            ),
            placeholder: t(
              "restrictions.placeholder",
            ),
            hint: t(
              "restrictions.hint",
            ),
          },
          save: t("save"),
          saving: t("saving"),
          saved: t("saved"),
        }}
      />
    </div>
  );
}

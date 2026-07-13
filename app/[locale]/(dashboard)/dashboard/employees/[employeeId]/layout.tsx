import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { EmployeeWorkspaceNav } from "@/features/ai-employees/components/employee-workspace-nav";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { cn } from "@/lib/utils";

type AIEmployeeLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function AIEmployeeLayout({
  children,
  params,
}: AIEmployeeLayoutProps) {
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

  const employeeBaseHref =
    `/${locale}/dashboard/employees/${employee.id}`;

  return (
    <div className="space-y-8">
      <section>
        <Link
          href={`/${locale}/dashboard/employees`}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-tight">
                  {employee.name}
                </h1>

                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
                    employee.status === "ACTIVE" &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                    employee.status === "DRAFT" &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-400",
                    employee.status === "PAUSED" &&
                      "border-orange-500/30 bg-orange-500/10 text-orange-400",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {t(`statuses.${employee.status.toLowerCase()}`)}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {employee.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      <EmployeeWorkspaceNav
        baseHref={employeeBaseHref}
        navigationLabel={t("navigationLabel")}
        labels={{
          overview: t("tabs.overview"),
          instructions: t("tabs.instructions"),
          knowledge: t("tabs.knowledge"),
          channels: t("tabs.channels"),
          tools: t("tabs.tools"),
          testChat: t("tabs.testChat"),
          conversations: t("tabs.conversations"),
          analytics: t("tabs.analytics"),
          settings: t("tabs.settings"),
        }}
      />

      {children}
    </div>
  );
}
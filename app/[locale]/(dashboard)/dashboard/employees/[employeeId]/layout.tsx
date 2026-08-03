import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
} from "lucide-react";
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
  const { locale, employeeId } =
    await params;

  const t = await getTranslations(
    "aiEmployeeDetails",
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

  const employeeBaseHref =
    `/${locale}/dashboard/employees/${employee.id}`;

  return (
    <div className="min-w-0 space-y-3">
      <header className="rounded-xl border bg-card p-3 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <Link
            href={`/${locale}/dashboard/employees`}
            aria-label={t("back")}
            title={t("back")}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Bot className="size-4 text-muted-foreground" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
              <h1 className="max-w-full break-words text-base font-semibold leading-6 tracking-tight sm:text-xl">
                {employee.name}
              </h1>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  employee.status === "ACTIVE" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
                  employee.status === "DRAFT" &&
                    "border-amber-500/30 bg-amber-500/10 text-amber-500",
                  employee.status === "PAUSED" &&
                    "border-orange-500/30 bg-orange-500/10 text-orange-500",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />

                {t(
                  `statuses.${employee.status.toLowerCase()}`,
                )}
              </span>
            </div>

            <p className="mt-1 break-words text-xs leading-5 text-muted-foreground sm:truncate sm:text-sm">
              {employee.role}
            </p>
          </div>

          <Link
            href={`/${locale}/dashboard/employees`}
            className="hidden shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            {t("back")}
          </Link>
        </div>
      </header>

      <EmployeeWorkspaceNav
        baseHref={employeeBaseHref}
        navigationLabel={t(
          "navigationLabel",
        )}
        moreLabel={t("tabs.more")}
        labels={{
          overview: t("tabs.overview"),
          instructions: t(
            "tabs.instructions",
          ),
          knowledge: t(
            "tabs.knowledge",
          ),
          channels: t(
            "tabs.channels",
          ),
          tools: t("tabs.tools"),
          testChat: t(
            "tabs.testChat",
          ),
          conversations: t(
            "tabs.conversations",
          ),
          analytics: t(
            "tabs.analytics",
          ),
          settings: t(
            "tabs.settings",
          ),
        }}
      />

      <main className="min-w-0 pb-2">
        {children}
      </main>
    </div>
  );
}

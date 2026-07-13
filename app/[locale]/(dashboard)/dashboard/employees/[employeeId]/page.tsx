import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAIEmployee } from "@/features/ai-employees/get-ai-employee";
import { getCurrentWorkspace } from "@/lib/current-workspace";

type AIEmployeePageProps = {
  params: Promise<{
    locale: string;
    employeeId: string;
  }>;
};

export default async function AIEmployeePage({
  params,
}: AIEmployeePageProps) {
  const { locale, employeeId } = await params;

  const workspace = await getCurrentWorkspace();

  const employee = await getAIEmployee({
    employeeId,
    workspaceId: workspace.id,
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section>
        <Link
          href={`/${locale}/dashboard/employees`}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          Back to AI Employees
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
              <Bot className="size-5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-tight">
                  {employee.name}
                </h1>

                <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                  {employee.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {employee.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {employee.description || "No description added yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium">{employee.language}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Tone</span>
              <span className="font-medium capitalize">
                {employee.tone || "Not set"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <time
                dateTime={employee.createdAt.toISOString()}
                className="font-medium"
              >
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(employee.createdAt)}
              </time>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
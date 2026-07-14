import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  description: string;
  createEmployeeLabel: string;
  createEmployeeHref: string;
};

export function DashboardHeader({
  title,
  description,
  createEmployeeLabel,
  createEmployeeHref,
}: DashboardHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card px-6 py-8 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_42%)]"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
            <Sparkles className="size-3.5" />
            Sellora Workspace
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href={createEmployeeHref} />}
          >
            <Plus className="size-4" />
            {createEmployeeLabel}
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/en/dashboard/employees" />}
          >
            View AI Employees
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
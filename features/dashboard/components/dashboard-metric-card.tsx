import type { LucideIcon } from "lucide-react";

type DashboardMetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardMetricCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/15">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
          <Icon className="size-4 text-muted-foreground" />
        </span>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
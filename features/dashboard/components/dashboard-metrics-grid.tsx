import {
  Bot,
  BookOpen,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

import { DashboardMetricCard } from "./dashboard-metric-card";

type Metric = {
  title: string;
  value: string;
  description: string;
};

type DashboardMetricsGridProps = {
  metrics: {
    aiEmployees: Metric;
    knowledgeSources: Metric;
    conversations: Metric;
    resolutionRate: Metric;
  };
};

export function DashboardMetricsGrid({
  metrics,
}: DashboardMetricsGridProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard
        title={metrics.aiEmployees.title}
        value={metrics.aiEmployees.value}
        description={metrics.aiEmployees.description}
        icon={Bot}
      />

      <DashboardMetricCard
        title={metrics.knowledgeSources.title}
        value={metrics.knowledgeSources.value}
        description={metrics.knowledgeSources.description}
        icon={BookOpen}
      />

      <DashboardMetricCard
        title={metrics.conversations.title}
        value={metrics.conversations.value}
        description={metrics.conversations.description}
        icon={MessageSquare}
      />

      <DashboardMetricCard
        title={metrics.resolutionRate.title}
        value={metrics.resolutionRate.value}
        description={metrics.resolutionRate.description}
        icon={TrendingUp}
      />
    </section>
  );
}
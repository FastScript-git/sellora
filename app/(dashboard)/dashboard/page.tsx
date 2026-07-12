import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  {
    title: "AI Employees",
    value: "0",
    description: "No employees created yet",
  },
  {
    title: "Conversations",
    value: "0",
    description: "No conversations yet",
  },
  {
    title: "AI Resolution Rate",
    value: "—",
    description: "Not enough data",
  },
  {
    title: "Knowledge Sources",
    value: "0",
    description: "No sources connected",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-primary">Overview</p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome to Sellora
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Create and manage AI Employees that support your business around the
          clock.
        </p>
      </section>

      <section
        aria-label="Workspace metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {metric.value}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
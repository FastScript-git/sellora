import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConversationChartPoint = {
  date: Date;
  dateKey: string;
  conversations: number;
};

type ConversationsChartProps = {
  locale: string;
  data: ConversationChartPoint[];
};

export function ConversationsChart({
  locale,
  data,
}: ConversationsChartProps) {
  const isUkrainian = locale === "uk";

  const maxValue = Math.max(
    1,
    ...data.map((item) => item.conversations),
  );

  const total = data.reduce(
    (sum, item) => sum + item.conversations,
    0,
  );

  const dateFormatter = new Intl.DateTimeFormat(
    isUkrainian ? "uk-UA" : "en-US",
    {
      day: "2-digit",
      month: "short",
    },
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>
              {isUkrainian
                ? "Розмови за останні 30 днів"
                : "Conversations over the last 30 days"}
            </CardTitle>

            <CardDescription className="mt-2">
              {isUkrainian
                ? "Кількість нових розмов у робочому просторі по днях."
                : "Daily new conversations across the workspace."}
            </CardDescription>
          </div>

          <div className="rounded-xl border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {isUkrainian
                ? "Усього за період"
                : "Total for period"}
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {total}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex min-w-[760px] items-end gap-2 border-b px-2 pb-3 pt-8">
            {data.map((item, index) => {
              const height =
                item.conversations === 0
                  ? 4
                  : Math.max(
                      14,
                      Math.round(
                        (item.conversations / maxValue) *
                          180,
                      ),
                    );

              const showLabel =
                index === 0 ||
                index === data.length - 1 ||
                index % 5 === 0;

              return (
                <div
                  key={item.dateKey}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div className="group relative flex h-48 w-full items-end justify-center">
                    <div
                      className="w-full max-w-5 rounded-t-md bg-primary/75 transition-colors hover:bg-primary"
                      style={{
                        height,
                      }}
                    />

                    <div className="pointer-events-none absolute -top-8 hidden rounded-md border bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                      {dateFormatter.format(item.date)}:{" "}
                      {item.conversations}
                    </div>
                  </div>

                  <span className="mt-2 h-4 text-[10px] text-muted-foreground">
                    {showLabel
                      ? dateFormatter.format(item.date)
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

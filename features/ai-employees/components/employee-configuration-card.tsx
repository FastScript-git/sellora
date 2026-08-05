import type { ComponentType } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConfigurationIcon = ComponentType<{
  className?: string;
}>;

export type EmployeeConfigurationItem = {
  key: string;
  label: string;
  value: string;
  icon: ConfigurationIcon;
};

type EmployeeConfigurationCardProps = {
  title: string;
  description: string;
  items: EmployeeConfigurationItem[];
};

export function EmployeeConfigurationCard({
  title,
  description,
  items,
}: EmployeeConfigurationCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">
          {title}
        </CardTitle>

        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="flex min-w-0 items-center justify-between gap-4 rounded-xl border bg-muted/10 px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <Icon className="size-3.5 text-muted-foreground" />
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>

              <span className="max-w-[52%] break-words text-right text-sm font-medium capitalize">
                {item.value}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

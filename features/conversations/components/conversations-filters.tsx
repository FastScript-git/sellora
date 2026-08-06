"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_EMPLOYEES_VALUE = "__all_employees__";
const ALL_CHANNELS_VALUE = "__all_channels__";

type EmployeeOption = {
  id: string;
  name: string;
};

type ChannelOption = {
  id: string;
  name: string;
  type: string;
};

type ConversationsFiltersProps = {
  employeeId?: string;
  channelId?: string;
  employees: EmployeeOption[];
  channels: ChannelOption[];
  allEmployeesLabel: string;
  allChannelsLabel: string;
};

export function ConversationsFilters({
  employeeId,
  channelId,
  employees,
  channels,
  allEmployeesLabel,
  allChannelsLabel,
}: ConversationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] =
    useTransition();

  function updateFilter(
    key: "employeeId" | "channelId",
    value: string | null,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    const allValue =
      key === "employeeId"
        ? ALL_EMPLOYEES_VALUE
        : ALL_CHANNELS_VALUE;

    if (!value || value === allValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Після зміни фільтра відкриваємо першу
    // доступну розмову з нового результату.
    params.delete("conversationId");

    const query = params.toString();

    startTransition(() => {
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname,
      );
    });
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
      <Select
        value={
          employeeId ||
          ALL_EMPLOYEES_VALUE
        }
        disabled={isPending}
        onValueChange={(value) => {
          updateFilter(
            "employeeId",
            value,
          );
        }}
      >
        <SelectTrigger
          className="h-9 w-full bg-background px-3"
          aria-label={allEmployeesLabel}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent
          align="start"
          sideOffset={6}
          className="p-1"
        >
          <SelectItem
            value={ALL_EMPLOYEES_VALUE}
            className="min-h-9 px-2.5"
          >
            {allEmployeesLabel}
          </SelectItem>

          {employees.map((employee) => (
            <SelectItem
              key={employee.id}
              value={employee.id}
              className="min-h-9 px-2.5"
            >
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={
          channelId ||
          ALL_CHANNELS_VALUE
        }
        disabled={isPending}
        onValueChange={(value) => {
          updateFilter(
            "channelId",
            value,
          );
        }}
      >
        <SelectTrigger
          className="h-9 w-full bg-background px-3"
          aria-label={allChannelsLabel}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent
          align="start"
          sideOffset={6}
          className="p-1"
        >
          <SelectItem
            value={ALL_CHANNELS_VALUE}
            className="min-h-9 px-2.5"
          >
            {allChannelsLabel}
          </SelectItem>

          {channels.map((channel) => (
            <SelectItem
              key={channel.id}
              value={channel.id}
              className="min-h-9 px-2.5"
            >
              <span className="min-w-0 truncate">
                {channel.name}
              </span>

              <span className="shrink-0 text-xs text-muted-foreground">
                · {channel.type}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

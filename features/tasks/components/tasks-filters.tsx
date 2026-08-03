"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useTransition } from "react";

type TaskFilterContact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

type TaskFilterEmployee = {
  id: string;
  name: string;
};

type TasksFiltersProps = {
  contacts: TaskFilterContact[];
  employees: TaskFilterEmployee[];
  locale: string;
  selectedStatus?: string;
  selectedPriority?: string;
  selectedContactId?: string;
  selectedEmployeeId?: string;
};

export function TasksFilters({
  contacts,
  employees,
  locale,
  selectedStatus,
  selectedPriority,
  selectedContactId,
  selectedEmployeeId,
}: TasksFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isUkrainian = locale === "uk";

  const copy = isUkrainian
    ? {
        status: "Статус",
        allStatuses: "Усі статуси",
        todo: "До виконання",
        inProgress: "У роботі",
        completed: "Виконано",
        canceled: "Скасовано",
        priority: "Пріоритет",
        allPriorities: "Усі пріоритети",
        low: "Низький",
        medium: "Середній",
        high: "Високий",
        urgent: "Терміновий",
        contact: "Контакт",
        allContacts: "Усі контакти",
        employee: "AI-співробітник",
        allEmployees: "Усі AI-співробітники",
        anonymous: "Анонімний контакт",
        clear: "Очистити",
      }
    : {
        status: "Status",
        allStatuses: "All statuses",
        todo: "To do",
        inProgress: "In progress",
        completed: "Completed",
        canceled: "Canceled",
        priority: "Priority",
        allPriorities: "All priorities",
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent",
        contact: "Contact",
        allContacts: "All contacts",
        employee: "AI Employee",
        allEmployees: "All AI Employees",
        anonymous: "Anonymous contact",
        clear: "Clear",
      };

  const hasFilters = Boolean(
    selectedStatus ||
      selectedPriority ||
      selectedContactId ||
      selectedEmployeeId,
  );

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      const query = params.toString();

      router.replace(
        query ? `${pathname}?${query}` : pathname,
      );
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <section className="rounded-2xl border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <FilterField label={copy.status}>
          <select
            value={selectedStatus ?? ""}
            disabled={isPending}
            onChange={(event) =>
              updateFilter("status", event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {copy.allStatuses}
            </option>
            <option value="TODO">{copy.todo}</option>
            <option value="IN_PROGRESS">
              {copy.inProgress}
            </option>
            <option value="COMPLETED">
              {copy.completed}
            </option>
            <option value="CANCELED">
              {copy.canceled}
            </option>
          </select>
        </FilterField>

        <FilterField label={copy.priority}>
          <select
            value={selectedPriority ?? ""}
            disabled={isPending}
            onChange={(event) =>
              updateFilter("priority", event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {copy.allPriorities}
            </option>
            <option value="LOW">{copy.low}</option>
            <option value="MEDIUM">
              {copy.medium}
            </option>
            <option value="HIGH">{copy.high}</option>
            <option value="URGENT">
              {copy.urgent}
            </option>
          </select>
        </FilterField>

        <FilterField label={copy.contact}>
          <select
            value={selectedContactId ?? ""}
            disabled={isPending}
            onChange={(event) =>
              updateFilter("contact", event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {copy.allContacts}
            </option>

            {contacts.map((contact) => (
              <option
                key={contact.id}
                value={contact.id}
              >
                {getContactName(
                  contact,
                  copy.anonymous,
                )}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label={copy.employee}>
          <select
            value={selectedEmployeeId ?? ""}
            disabled={isPending}
            onChange={(event) =>
              updateFilter("employee", event.target.value)
            }
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {copy.allEmployees}
            </option>

            {employees.map((employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.name}
              </option>
            ))}
          </select>
        </FilterField>

        <div className="flex items-end">
          <button
            type="button"
            disabled={!hasFilters || isPending}
            onClick={clearFilters}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}

            {copy.clear}
          </button>
        </div>
      </div>
    </section>
  );
}

type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FilterField({
  label,
  children,
}: FilterFieldProps) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
      </span>

      {children}
    </label>
  );
}

function getContactName(
  contact: TaskFilterContact,
  anonymousLabel: string,
) {
  const fullName = [
    contact.firstName,
    contact.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || contact.email || anonymousLabel;
}
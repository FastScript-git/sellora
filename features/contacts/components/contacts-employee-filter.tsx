"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_EMPLOYEES_VALUE = "all";
const ALL_STATUSES_VALUE = "all";

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
};

type StatusOption = {
  value: string;
  label: string;
};

type ContactsEmployeeFilterProps = {
  employees: EmployeeOption[];
  statuses: StatusOption[];
  selectedEmployeeId?: string;
  selectedStatus?: string;
  allEmployeesLabel: string;
  allStatusesLabel: string;
  employeeFilterLabel: string;
  statusFilterLabel: string;
};

export function ContactsEmployeeFilter({
  employees,
  statuses,
  selectedEmployeeId,
  selectedStatus,
  allEmployeesLabel,
  allStatusesLabel,
  employeeFilterLabel,
  statusFilterLabel,
}: ContactsEmployeeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateSearchParam(
    key: "employeeId" | "status",
    value: string | null,
    allValue: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (!value || value === allValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:flex xl:items-end">
      <div className="min-w-0 space-y-2">
        <span className="block text-xs font-medium text-muted-foreground">
          {employeeFilterLabel}
        </span>

        <Select
          value={
            selectedEmployeeId ||
            ALL_EMPLOYEES_VALUE
          }
          onValueChange={(value) =>
            updateSearchParam(
              "employeeId",
              value,
              ALL_EMPLOYEES_VALUE,
            )
          }
        >
          <SelectTrigger
            className="h-11 w-full min-w-0 xl:w-64"
            aria-label={
              employeeFilterLabel
            }
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            align="start"
            className="max-w-[calc(100vw-2rem)]"
          >
            <SelectItem
              value={
                ALL_EMPLOYEES_VALUE
              }
            >
              {allEmployeesLabel}
            </SelectItem>

            {employees.map(
              (employee) => (
                <SelectItem
                  key={employee.id}
                  value={employee.id}
                >
                  <span className="flex min-w-0 max-w-64 flex-col">
                    <span className="truncate">
                      {employee.name}
                    </span>

                    <span className="truncate text-xs text-muted-foreground">
                      {employee.role}
                    </span>
                  </span>
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-2">
        <span className="block text-xs font-medium text-muted-foreground">
          {statusFilterLabel}
        </span>

        <Select
          value={
            selectedStatus ||
            ALL_STATUSES_VALUE
          }
          onValueChange={(value) =>
            updateSearchParam(
              "status",
              value,
              ALL_STATUSES_VALUE,
            )
          }
        >
          <SelectTrigger
            className="h-11 w-full min-w-0 xl:w-56"
            aria-label={
              statusFilterLabel
            }
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            align="start"
            className="max-w-[calc(100vw-2rem)]"
          >
            <SelectItem
              value={
                ALL_STATUSES_VALUE
              }
            >
              {allStatusesLabel}
            </SelectItem>

            {statuses.map(
              (status) => (
                <SelectItem
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

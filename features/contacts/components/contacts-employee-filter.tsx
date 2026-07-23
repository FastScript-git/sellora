"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_EMPLOYEES_VALUE = "all";

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
};

type ContactsEmployeeFilterProps = {
  employees: EmployeeOption[];
  selectedEmployeeId?: string;
  allEmployeesLabel: string;
  filterLabel: string;
};

export function ContactsEmployeeFilter({
  employees,
  selectedEmployeeId,
  allEmployeesLabel,
  filterLabel,
}: ContactsEmployeeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedValue =
    selectedEmployeeId || ALL_EMPLOYEES_VALUE;

  function handleValueChange(value: string | null) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (!value || value === ALL_EMPLOYEES_VALUE) {
      params.delete("employeeId");
    } else {
      params.set("employeeId", value);
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        {filterLabel}
      </span>

      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          className="h-11 w-full min-w-56 sm:w-64"
          aria-label={filterLabel}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent align="start">
          <SelectItem value={ALL_EMPLOYEES_VALUE}>
            {allEmployeesLabel}
          </SelectItem>

          {employees.map((employee) => (
            <SelectItem
              key={employee.id}
              value={employee.id}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">
                  {employee.name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {employee.role}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
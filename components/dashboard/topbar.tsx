"use client";

import type { ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  Globe2,
  Moon,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TopbarProps = {
  title?: string;
  mobileNavigation?: ReactNode;
  className?: string;
};

export function Topbar({
  title = "Dashboard",
  mobileNavigation,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {mobileNavigation}

        <h1 className="truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
        <div className="relative hidden w-full max-w-sm md:block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            placeholder="Search Sellora..."
            aria-label="Search Sellora"
            className="h-9 pl-9"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Change language"
          title="Change language"
          className="hidden sm:inline-flex"
        >
          <Globe2 className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Change theme"
          title="Change theme"
          className="hidden sm:inline-flex"
        >
          <Moon className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open notifications"
          title="Notifications"
          className="relative"
        >
          <Bell className="size-4" />

          <span
            aria-hidden="true"
            className="absolute right-2 top-2 size-1.5 rounded-full bg-primary"
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-2 px-2"
          aria-label="Open user menu"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            ER
          </span>

          <span className="hidden text-left lg:block">
            <span className="block max-w-28 truncate text-sm font-medium">
              Evgenii
            </span>

            <span className="block text-xs text-muted-foreground">
              Workspace owner
            </span>
          </span>

          <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
        </Button>
      </div>
    </header>
  );
}
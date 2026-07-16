"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  MessageSquare,
  Radio,
  Settings,
  SlidersHorizontal,
  TestTube2,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    key: "overview",
    segment: "",
    icon: Activity,
  },
  {
    key: "instructions",
    segment: "instructions",
    icon: SlidersHorizontal,
  },
  {
    key: "knowledge",
    segment: "knowledge",
    icon: BookOpen,
  },
  {
    key: "channels",
    segment: "channels",
    icon: Radio,
  },
  {
    key: "tools",
    segment: "tools",
    icon: Wrench,
  },
  {
    key: "testChat",
    segment: "test-chat",
    icon: TestTube2,
  },
  {
    key: "conversations",
    segment: "conversations",
    icon: MessageSquare,
  },
  {
    key: "analytics",
    segment: "analytics",
    icon: BarChart3,
  },
  {
    key: "settings",
    segment: "settings",
    icon: Settings,
  },
] as const;

type EmployeeWorkspaceNavProps = {
  baseHref: string;
  navigationLabel: string;
  labels: Record<(typeof tabs)[number]["key"], string>;
};

export function EmployeeWorkspaceNav({
  baseHref,
  navigationLabel,
  labels,
}: EmployeeWorkspaceNavProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <nav
        aria-label={navigationLabel}
        className="overflow-x-auto rounded-2xl border bg-card/70 p-1.5 shadow-sm"
      >
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            const href = tab.segment
              ? `${baseHref}/${tab.segment}`
              : baseHref;

            const isActive = tab.segment
              ? pathname === href || pathname.startsWith(`${href}/`)
              : pathname === baseHref;

            return (
              <Link
                key={tab.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />

                <span>{labels[tab.key]}</span>

                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-1.5 h-px rounded-full bg-primary"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-2xl bg-gradient-to-l from-background to-transparent sm:hidden"
      />
    </div>
  );
}
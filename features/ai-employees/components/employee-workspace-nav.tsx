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
    <nav
      aria-label={navigationLabel}
      className="overflow-x-auto border-b"
    >
      <div className="flex min-w-max gap-1">
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
                "relative inline-flex h-11 items-center gap-2 px-3 text-sm font-medium text-muted-foreground transition-colors",
                "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                isActive && "text-foreground",
              )}
            >
              <Icon className="size-4" />
              {labels[tab.key]}

              {isActive ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
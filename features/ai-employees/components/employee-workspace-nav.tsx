"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronDown,
  MessageSquare,
  Radio,
  Settings,
  SlidersHorizontal,
  TestTube2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  {
    key: "overview",
    segment: "",
    icon: Activity,
    section: "main",
  },
  {
    key: "testChat",
    segment: "test-chat",
    icon: TestTube2,
    section: "main",
  },
  {
    key: "instructions",
    segment: "instructions",
    icon: SlidersHorizontal,
    section: "main",
  },
  {
    key: "knowledge",
    segment: "knowledge",
    icon: BookOpen,
    section: "main",
  },
  {
    key: "tools",
    segment: "tools",
    icon: Wrench,
    section: "main",
  },
  {
    key: "channels",
    segment: "channels",
    icon: Radio,
    section: "main",
  },
  {
    key: "conversations",
    segment: "conversations",
    icon: MessageSquare,
    section: "main",
  },
  {
    key: "analytics",
    segment: "analytics",
    icon: BarChart3,
    section: "main",
  },
  {
    key: "settings",
    segment: "settings",
    icon: Settings,
    section: "settings",
  },
] as const;

type Tab = (typeof tabs)[number];
type TabKey = Tab["key"];

type EmployeeWorkspaceNavProps = {
  baseHref: string;
  navigationLabel: string;
  moreLabel: string;
  labels: Record<TabKey, string>;
};

function getTabHref(
  baseHref: string,
  tab: Tab,
) {
  return tab.segment
    ? `${baseHref}/${tab.segment}`
    : baseHref;
}

function isTabActive({
  pathname,
  href,
  segment,
}: {
  pathname: string;
  href: string;
  segment: string;
}) {
  if (!segment) {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function EmployeeWorkspaceNav({
  baseHref,
  navigationLabel,
  labels,
}: EmployeeWorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const mainTabs = tabs.filter(
    (tab) =>
      tab.section === "main",
  );

  const settingsTab = tabs.find(
    (tab) =>
      tab.section === "settings",
  );

  const activeTab =
    tabs.find((tab) => {
      const href = getTabHref(
        baseHref,
        tab,
      );

      return isTabActive({
        pathname,
        href,
        segment: tab.segment,
      });
    }) ?? tabs[0];

  return (
    <div className="w-full min-w-0">
      {/* Mobile */}
      <div className="md:hidden">
        <label
          htmlFor="employee-workspace-navigation"
          className="sr-only"
        >
          {navigationLabel}
        </label>

        <div className="relative">
          <select
            id="employee-workspace-navigation"
            value={activeTab.key}
            onChange={(event) => {
              const nextTab =
                tabs.find(
                  (tab) =>
                    tab.key ===
                    event.target.value,
                );

              if (!nextTab) {
                return;
              }

              router.push(
                getTabHref(
                  baseHref,
                  nextTab,
                ),
              );
            }}
            className="h-11 w-full appearance-none rounded-xl border bg-card px-4 pr-10 text-sm font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {tabs.map((tab) => (
              <option
                key={tab.key}
                value={tab.key}
              >
                {labels[tab.key]}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>

      {/* Desktop */}
      <nav
        aria-label={navigationLabel}
        className="hidden min-w-0 items-center rounded-xl border bg-card/70 p-1 shadow-sm md:flex"
      >
        <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          <div className="flex w-max min-w-full items-center gap-0.5">
            {mainTabs.map(
              (tab) => {
                const Icon =
                  tab.icon;

                const href =
                  getTabHref(
                    baseHref,
                    tab,
                  );

                const active =
                  isTabActive({
                    pathname,
                    href,
                    segment:
                      tab.segment,
                  });

                return (
                  <Link
                    key={tab.key}
                    href={href}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "group relative inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium transition-colors lg:px-3",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0",
                        active
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />

                    <span className="whitespace-nowrap">
                      {
                        labels[
                          tab.key
                        ]
                      }
                    </span>

                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-1 h-px rounded-full bg-primary"
                      />
                    ) : null}
                  </Link>
                );
              },
            )}
          </div>
        </div>

        {settingsTab ? (
          <div className="ml-1 shrink-0 border-l pl-1">
            {(() => {
              const Icon =
                settingsTab.icon;

              const href =
                getTabHref(
                  baseHref,
                  settingsTab,
                );

              const active =
                isTabActive({
                  pathname,
                  href,
                  segment:
                    settingsTab.segment,
                });

              return (
                <Link
                  href={href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  title={
                    labels.settings
                  }
                  className={cn(
                    "group relative flex h-9 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium transition-colors lg:px-3",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />

                  <span className="hidden whitespace-nowrap xl:inline">
                    {
                      labels.settings
                    }
                  </span>

                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2 -bottom-1 h-px rounded-full bg-primary"
                    />
                  ) : null}
                </Link>
              );
            })()}
          </div>
        ) : null}
      </nav>
    </div>
  );
}

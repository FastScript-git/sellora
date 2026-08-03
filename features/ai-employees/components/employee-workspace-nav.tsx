"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Radio,
  Settings,
  SlidersHorizontal,
  TestTube2,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const tabs = [
  {
    key: "overview",
    segment: "",
    icon: Activity,
    primary: true,
  },
  {
    key: "instructions",
    segment: "instructions",
    icon: SlidersHorizontal,
    primary: true,
  },
  {
    key: "knowledge",
    segment: "knowledge",
    icon: BookOpen,
    primary: true,
  },
  {
    key: "channels",
    segment: "channels",
    icon: Radio,
    primary: true,
  },
  {
    key: "tools",
    segment: "tools",
    icon: Wrench,
    primary: true,
  },
  {
    key: "testChat",
    segment: "test-chat",
    icon: TestTube2,
    primary: true,
  },
  {
    key: "conversations",
    segment: "conversations",
    icon: MessageSquare,
    primary: false,
  },
  {
    key: "analytics",
    segment: "analytics",
    icon: BarChart3,
    primary: false,
  },
  {
    key: "settings",
    segment: "settings",
    icon: Settings,
    primary: false,
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
  moreLabel,
  labels,
}: EmployeeWorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const primaryTabs = tabs.filter(
    (tab) => tab.primary,
  );

  const secondaryTabs = tabs.filter(
    (tab) => !tab.primary,
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

  const secondaryTabActive =
    secondaryTabs.some((tab) => {
      const href = getTabHref(
        baseHref,
        tab,
      );

      return isTabActive({
        pathname,
        href,
        segment: tab.segment,
      });
    });

  return (
    <div className="w-full min-w-0">
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
              const nextTab = tabs.find(
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

      <nav
        aria-label={navigationLabel}
        className="hidden min-w-0 items-center overflow-hidden rounded-xl border bg-card/70 p-1 shadow-sm md:flex"
      >
        <div
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain"
          style={{
            scrollbarWidth: "thin",
          }}
        >
          <div className="flex w-max min-w-full items-center gap-1">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;

              const href = getTabHref(
                baseHref,
                tab,
              );

              const active = isTabActive({
                pathname,
                href,
                segment: tab.segment,
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
                    "group relative inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />

                  <span className="whitespace-nowrap">
                    {labels[tab.key]}
                  </span>

                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-1 h-px rounded-full bg-primary"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ml-1 shrink-0 border-l bg-card/70 pl-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant={
                    secondaryTabActive
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="h-10 gap-1.5 px-2.5 lg:px-3"
                />
              }
            >
              <MoreHorizontal className="size-4" />

              <span className="hidden lg:inline">
                {moreLabel}
              </span>

              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="min-w-56"
            >
              {secondaryTabs.map(
                (tab) => {
                  const Icon = tab.icon;

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
                    <DropdownMenuItem
                      key={tab.key}
                      render={
                        <Link
                          href={href}
                          className={cn(
                            "flex w-full items-center gap-2",
                            active &&
                              "font-medium text-primary",
                          )}
                        />
                      }
                    >
                      <Icon className="size-4 shrink-0" />

                      <span className="min-w-0 flex-1">
                        {labels[tab.key]}
                      </span>

                      {active ? (
                        <span className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </DropdownMenuItem>
                  );
                },
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}

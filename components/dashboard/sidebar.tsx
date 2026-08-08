"use client";

import {
  BarChart3,
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Columns3,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import {
  useCallback,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY =
  "sellora:sidebar-collapsed";

const SIDEBAR_CHANGE_EVENT =
  "sellora:sidebar-change";

const navigationGroups = [
  {
    key: "overview",
    items: [
      {
        labelKey: "dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    key: "aiWorkforce",
    items: [
      {
        labelKey: "aiEmployees",
        path: "/dashboard/employees",
        icon: Bot,
      },
    ],
  },
  {
    key: "customers",
    items: [
      {
        labelKey: "conversations",
        path: "/dashboard/conversations",
        icon: MessageSquare,
      },
      {
        labelKey: "contacts",
        path: "/dashboard/contacts",
        icon: Users,
      },
      {
        labelKey: "pipeline",
        path: "/dashboard/pipeline",
        icon: Columns3,
      },
    ],
  },
  {
    key: "operations",
    items: [
      {
        labelKey: "tasks",
        path: "/dashboard/tasks",
        icon: ClipboardList,
      },
      {
        labelKey: "automations",
        path: "/dashboard/workflows",
        icon: Zap,
        customLabel: "workflows",
      },
      {
        labelKey: "calendar",
        path: "/dashboard/calendar",
        icon: CalendarDays,
      },
    ],
  },
  {
    key: "insights",
    items: [
      {
        labelKey: "analytics",
        path: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
] as const;

const workspaceNavigationItems = [
  {
    labelKey: "settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
  {
    labelKey: "billing",
    path: "/dashboard/billing",
    icon: CreditCard,
  },
] as const;

function subscribeSidebarState(
  callback: () => void,
) {
  function handleStorage(
    event: StorageEvent,
  ) {
    if (
      event.key ===
      SIDEBAR_STORAGE_KEY
    ) {
      callback();
    }
  }

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    SIDEBAR_CHANGE_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      SIDEBAR_CHANGE_EVENT,
      callback,
    );
  };
}

function getSidebarStateSnapshot() {
  return (
    window.localStorage.getItem(
      SIDEBAR_STORAGE_KEY,
    ) === "true"
  );
}

function getSidebarServerSnapshot() {
  return false;
}

type SidebarProps = {
  activePath?: string;
  className?: string;
  collapsible?: boolean;
};

export function Sidebar({
  activePath,
  className,
  collapsible = true,
}: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();

  const navigation =
    useTranslations("navigation");

  const sidebar =
    useTranslations("sidebar");

  const storedCollapsed =
    useSyncExternalStore(
      subscribeSidebarState,
      getSidebarStateSnapshot,
      getSidebarServerSnapshot,
    );

  const isCollapsed =
    collapsible &&
    storedCollapsed;

  const currentPath =
    activePath ?? pathname;

  const isUkrainian =
    locale === "uk";

  const groupLabels = {
    overview: isUkrainian
      ? "Огляд"
      : "Overview",

    aiWorkforce: isUkrainian
      ? "AI команда"
      : "AI Workforce",

    customers: isUkrainian
      ? "Клієнти"
      : "Customers",

    operations: isUkrainian
      ? "Операції"
      : "Operations",

    insights: isUkrainian
      ? "Аналітика"
      : "Insights",

    workspace: isUkrainian
      ? "Робочий простір"
      : "Workspace",
  };

  function createLocalizedHref(
    path: string,
  ) {
    return `/${locale}${path}`;
  }

  function isItemActive(
    path: string,
  ) {
    const localizedPath =
      createLocalizedHref(path);

    if (path === "/dashboard") {
      return (
        currentPath ===
        localizedPath
      );
    }

    return currentPath.startsWith(
      localizedPath,
    );
  }

  function getItemLabel(
    item: {
      labelKey:
        | "dashboard"
        | "aiEmployees"
        | "conversations"
        | "contacts"
        | "pipeline"
        | "tasks"
        | "automations"
        | "calendar"
        | "analytics";

      customLabel?: "workflows";
    },
  ) {
    if (
      item.customLabel ===
      "workflows"
    ) {
      return "Workflows";
    }

    return navigation(
      item.labelKey,
    );
  }

  const toggleCollapsed =
    useCallback(() => {
      if (!collapsible) {
        return;
      }

      const nextValue =
        !storedCollapsed;

      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(nextValue),
      );

      window.dispatchEvent(
        new Event(
          SIDEBAR_CHANGE_EVENT,
        ),
      );
    }, [
      collapsible,
      storedCollapsed,
    ]);

  return (
    <aside
      className={cn(
        "relative z-30 flex h-dvh shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-200 ease-out",
        isCollapsed
          ? "w-[72px]"
          : "w-70",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-14 shrink-0 items-center border-b",
          isCollapsed
            ? "justify-center px-2"
            : "px-4",
        )}
      >
        <Link
          href={createLocalizedHref(
            "/dashboard",
          )}
          aria-label="Sellora dashboard"
          className={cn(
            "flex min-w-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCollapsed
              ? "justify-center"
              : "gap-2",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>

          {!isCollapsed ? (
            <span className="truncate text-lg font-semibold tracking-tight">
              Sellora
            </span>
          ) : null}
        </Link>

        {collapsible ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={
              toggleCollapsed
            }
            aria-label={
              isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            aria-expanded={
              !isCollapsed
            }
            className={cn(
              "absolute -right-3.5 top-1/2 z-50 size-7 -translate-y-1/2 cursor-pointer rounded-full bg-background shadow-sm",
              "text-muted-foreground hover:text-foreground",
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </Button>
        ) : null}
      </div>

      <nav
        aria-label="Main navigation"
        className={cn(
          "min-h-0 flex-1 py-2.5",
          isCollapsed
            ? "px-2"
            : "px-3",
        )}
      >
        <div
          className={cn(
            isCollapsed
              ? "space-y-1"
              : "space-y-2.5",
          )}
        >
          {navigationGroups.map(
            (group) => (
              <div
                key={group.key}
              >
                {!isCollapsed ? (
                  <p className="mb-0.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                    {
                      groupLabels[
                        group.key
                      ]
                    }
                  </p>
                ) : null}

                <div className="space-y-0.5">
                  {group.items.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const href =
                        createLocalizedHref(
                          item.path,
                        );

                      const active =
                        isItemActive(
                          item.path,
                        );

                      const label =
                        getItemLabel(
                          item,
                        );

                      return (
                        <Link
                          key={
                            item.path
                          }
                          href={href}
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                          aria-label={
                            isCollapsed
                              ? label
                              : undefined
                          }
                          className={cn(
                            "group relative flex h-8 w-full items-center rounded-lg text-sm font-medium",
                            "text-muted-foreground transition-colors",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isCollapsed
                              ? "justify-center px-0"
                              : "gap-3 px-2.5",
                            active &&
                              "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              active &&
                                "text-foreground",
                            )}
                          />

                          {!isCollapsed ? (
                            <span className="truncate">
                              {label}
                            </span>
                          ) : (
                            <span
                              role="tooltip"
                              className={cn(
                                "pointer-events-none absolute left-full top-1/2 z-[100] ml-3 -translate-y-1/2",
                                "whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md",
                                "invisible translate-x-1 opacity-0 transition-[opacity,transform,visibility] duration-150",
                                "group-hover:visible group-hover:translate-x-0 group-hover:opacity-100",
                                "group-focus-visible:visible group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                              )}
                            >
                              {label}
                            </span>
                          )}
                        </Link>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </nav>

      <div
        className={cn(
          "shrink-0",
          isCollapsed
            ? "px-2"
            : "px-3",
        )}
      >
        <Separator />
      </div>

      <nav
        aria-label="Workspace navigation"
        className={cn(
          "shrink-0 py-2",
          isCollapsed
            ? "px-2"
            : "px-3",
        )}
      >
        {!isCollapsed ? (
          <p className="mb-0.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
            {
              groupLabels.workspace
            }
          </p>
        ) : null}

        <div className="space-y-0.5">
          {workspaceNavigationItems.map(
            (item) => {
              const Icon =
                item.icon;

              const href =
                createLocalizedHref(
                  item.path,
                );

              const active =
                isItemActive(
                  item.path,
                );

              const label =
                navigation(
                  item.labelKey,
                );

              return (
                <Link
                  key={item.path}
                  href={href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  aria-label={
                    isCollapsed
                      ? label
                      : undefined
                  }
                  className={cn(
                    "group relative flex h-8 w-full items-center rounded-lg text-sm font-medium",
                    "text-muted-foreground transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isCollapsed
                      ? "justify-center px-0"
                      : "gap-3 px-2.5",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active &&
                        "text-foreground",
                    )}
                  />

                  {!isCollapsed ? (
                    <span className="truncate">
                      {label}
                    </span>
                  ) : (
                    <span
                      role="tooltip"
                      className={cn(
                        "pointer-events-none absolute left-full top-1/2 z-[100] ml-3 -translate-y-1/2",
                        "whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md",
                        "invisible translate-x-1 opacity-0 transition-[opacity,transform,visibility] duration-150",
                        "group-hover:visible group-hover:translate-x-0 group-hover:opacity-100",
                        "group-focus-visible:visible group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                      )}
                    >
                      {label}
                    </span>
                  )}
                </Link>
              );
            },
          )}
        </div>
      </nav>

      {!isCollapsed ? (
        <div className="shrink-0 p-3 pt-0">
          <div className="rounded-xl border bg-card p-2.5">
            <p className="text-xs font-medium">
              {sidebar(
                "freePlan",
              )}
            </p>

            <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
              {sidebar(
                "upgradeDescription",
              )}
            </p>

            <Button
              className="mt-2 h-7 w-full cursor-pointer text-xs"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={createLocalizedHref(
                    "/dashboard/billing",
                  )}
                />
              }
            >
              {sidebar(
                "upgradePlan",
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

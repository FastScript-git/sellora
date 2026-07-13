"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3,
  BookOpen,
  Bot,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Radio,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    labelKey: "dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "aiEmployees",
    path: "/dashboard/employees",
    icon: Bot,
  },
  {
    labelKey: "knowledgeBase",
    path: "/dashboard/knowledge",
    icon: BookOpen,
  },
  {
    labelKey: "conversations",
    path: "/dashboard/conversations",
    icon: MessageSquare,
  },
  {
    labelKey: "channels",
    path: "/dashboard/channels",
    icon: Radio,
  },
  {
    labelKey: "automations",
    path: "/dashboard/automations",
    icon: Workflow,
  },
  {
    labelKey: "contacts",
    path: "/dashboard/contacts",
    icon: Users,
  },
  {
    labelKey: "analytics",
    path: "/dashboard/analytics",
    icon: BarChart3,
  },
] as const;

const secondaryNavigationItems = [
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

type SidebarProps = {
  activePath?: string;
  className?: string;
};

export function Sidebar({ activePath, className }: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const navigation = useTranslations("navigation");
  const sidebar = useTranslations("sidebar");

  const currentPath = activePath ?? pathname;

  function createLocalizedHref(path: string) {
    return `/${locale}${path}`;
  }

  function isItemActive(path: string) {
    const localizedPath = createLocalizedHref(path);

    if (path === "/dashboard") {
      return currentPath === localizedPath;
    }

    return currentPath.startsWith(localizedPath);
  }

  return (
    <aside
      className={cn(
        "flex h-screen w-70 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center px-5">
        <Link
          href={createLocalizedHref("/dashboard")}
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>

          <span className="text-lg font-semibold tracking-tight">Sellora</span>
        </Link>
      </div>

      <Separator />

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const href = createLocalizedHref(item.path);
          const isActive = isItemActive(item.path);

          return (
            <Link
              key={item.path}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{navigation(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3">
        <Separator />
      </div>

      <nav
        aria-label="Workspace navigation"
        className="space-y-1 px-3 py-4"
      >
        {secondaryNavigationItems.map((item) => {
          const Icon = item.icon;
          const href = createLocalizedHref(item.path);
          const isActive = isItemActive(item.path);

          return (
            <Link
              key={item.path}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{navigation(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 pt-0">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-sm font-medium">{sidebar("freePlan")}</p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {sidebar("upgradeDescription")}
          </p>

          <Button className="mt-3 w-full" size="sm">
            {sidebar("upgradePlan")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
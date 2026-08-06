import type { ReactNode } from "react";

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-dvh min-h-0 min-w-0 overflow-hidden bg-background">
      <Sidebar className="hidden xl:flex" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          mobileNavigation={
            <MobileSidebar />
          }
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="mx-auto min-h-full min-w-0 w-full max-w-7xl px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4 md:px-6 md:pb-10 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

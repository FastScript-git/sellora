import type { ReactNode } from "react";

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar className="hidden lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar mobileNavigation={<MobileSidebar />} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
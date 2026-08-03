import type { ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto min-h-full w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

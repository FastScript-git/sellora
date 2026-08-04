import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  await auth.protect();

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
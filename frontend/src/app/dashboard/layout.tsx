import { DashboardGuard } from "./dashboard-guard";
import { DashboardLayout } from "@components/layout/dashboard-layout";
import type { ReactNode } from "react";

export default function DashboardPageLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardGuard>
  );
}

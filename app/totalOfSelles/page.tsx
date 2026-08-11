import { requirePagePermission } from "@/lib/session";
import { getTotalSalesStats } from "@/lib/sales/totals";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TotalSalesView } from "@/components/sales/total-sales-view";

export const metadata = {
  title: "عرض اجمالي دخل المبيعات",
  description: "عرض اجمالي دخل المبيعات",
};

export default async function TotalOfSellesPage() {
  const { session, permissions } = await requirePagePermission("total_sales");
  const user = session.user;

  const stats = await getTotalSalesStats();

  return (
    <DashboardShell user={{ name: user.name, role: user.role, permissions }} titleKey="sidebar.totalSales">
      <div className="relative flex w-full flex-col overflow-hidden min-h-[calc(100dvh-14rem)]">
        <div
          className="pointer-events-none absolute -top-10 -end-16 size-60 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-16 size-60 rounded-full bg-warning/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex-1">
          <TotalSalesView initialStats={stats} />
        </div>
      </div>
    </DashboardShell>
  );
}

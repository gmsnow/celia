import { requirePagePermission } from "@/lib/session";
import { getMonthlyIncomeStats } from "@/lib/income/monthly";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MonthlyIncomeView } from "@/components/income/monthly-income-view";

export const metadata = {
  title: "الدخل الشهري",
  description: "عرض الدخل الشهري",
};

export default async function MonthlyIncomePage() {
  const { session, permissions } = await requirePagePermission("monthly_income");
  const user = session.user;

  const stats = await getMonthlyIncomeStats();

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, permissions }}
      titleKey="sidebar.monthlyIncome"
    >
      <div className="relative flex w-full flex-col overflow-hidden min-h-[calc(100dvh-14rem)]">
        <div
          className="pointer-events-none absolute -top-10 -end-16 size-60 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-16 size-60 rounded-full bg-success/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex-1">
          <MonthlyIncomeView initialStats={stats} />
        </div>
      </div>
    </DashboardShell>
  );
}

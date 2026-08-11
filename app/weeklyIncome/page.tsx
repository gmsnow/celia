import { requirePagePermission } from "@/lib/session";
import { getWeeklyIncomeStats } from "@/lib/income/weekly";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { IncomeSummaryView } from "@/components/income/income-summary-view";

export const metadata = {
  title: "عرض الدخل الأسبوعي",
  description: "عرض الدخل الأسبوعي",
};

export const dynamic = "force-dynamic";

export default async function WeeklyIncomePage() {
  const { session, permissions } = await requirePagePermission("weekly_income");
  const user = session.user;

  const stats = await getWeeklyIncomeStats();

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, permissions }}
      titleKey="incomeView.title"
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
          <IncomeSummaryView initialStats={stats} section="incomeView" />
        </div>
      </div>
    </DashboardShell>
  );
}

import { requirePagePermission } from "@/lib/session";
import { getAdvances, getEmployees } from "@/lib/advances/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AdvancesView } from "@/components/advances/advances-view";

export const metadata = {
  title: "عرض السلف",
  description: "عرض السلف وإضافة سلفة جديدة",
};

export default async function ShowAdvancesPage() {
  const { session, permissions } = await requirePagePermission("view_loans");
  const user = session.user;

  const [summary, employees] = await Promise.all([getAdvances(), getEmployees()]);

  return (
    <DashboardShell user={{ name: user.name, role: user.role, permissions }} titleKey="sidebar.viewAdvances">
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
          <AdvancesView initialSummary={summary} employees={employees} />
        </div>
      </div>
    </DashboardShell>
  );
}

import { requireUser } from "@/lib/session";
import { getEmployees } from "@/lib/employees/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SalaryView } from "@/components/employees/salary-view";

export const metadata = {
  title: "رواتب الموظفين",
  description: "تعديل رواتب الموظفين",
};

export default async function SalaryPage() {
  const session = await requireUser();
  const user = session.user;

  const summary = await getEmployees();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.editSalaries">
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
          <SalaryView initialSummary={summary} />
        </div>
      </div>
    </DashboardShell>
  );
}

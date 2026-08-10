import { requireUser } from "@/lib/session";
import { getShiftsStats } from "@/lib/income/shifts";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ShiftsView } from "@/components/income/shifts-view";

export const metadata = {
  title: "دخل الفترتين الصباحية والمسائية",
  description: "عرض دخل الفترتين الصباحية والمسائية",
};

export const dynamic = "force-dynamic";

export default async function ShiftsPage() {
  const session = await requireUser();
  const user = session.user;

  const stats = await getShiftsStats();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.shifts">
      <div className="relative flex w-full flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute -top-10 -end-16 size-60 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-16 size-60 rounded-full bg-success/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6">
          <ShiftsView initialStats={stats} />
        </div>
      </div>
    </DashboardShell>
  );
}

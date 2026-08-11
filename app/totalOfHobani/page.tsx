import { requirePagePermission } from "@/lib/session";
import { getHobaniTotals } from "@/lib/hobani/totals";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HobaniTotalsView } from "@/components/hobani/hobani-totals-view";

export const metadata = {
  title: "عرض اجمالي دخل الحوباني",
  description: "عرض جميع صادرات الحوباني",
};

export default async function TotalOfHobaniPage() {
  const { session, permissions } = await requirePagePermission("total_hobani_income");
  const user = session.user;

  const rows = await getHobaniTotals();

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, permissions }}
      titleKey="sidebar.totalHobani"
    >
      <div className="relative flex w-full flex-col overflow-hidden min-h-[calc(100dvh-14rem)]">
        <div
          className="pointer-events-none absolute -top-10 -end-16 size-60 rounded-full bg-warning/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-16 size-60 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex-1">
          <HobaniTotalsView initialRows={rows} />
        </div>
      </div>
    </DashboardShell>
  );
}

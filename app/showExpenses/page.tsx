import { requireUser } from "@/lib/session";
import { getExpenses } from "@/lib/expenses/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ExpensesView } from "@/components/expenses/expenses-view";

export const metadata = {
  title: "عرض المصروفات",
  description: "عرض المصروفات وإضافة مصروف جديد",
};

export default async function ShowExpensesPage() {
  const session = await requireUser();
  const user = session.user;

  const summary = await getExpenses();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.viewExpenses">
      <div className="relative flex w-full flex-col overflow-hidden min-h-[calc(100dvh-14rem)]">
        <div
          className="pointer-events-none absolute -top-10 -end-16 size-60 rounded-full bg-destructive/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-16 size-60 rounded-full bg-warning/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex-1">
          <ExpensesView initialSummary={summary} />
        </div>
      </div>
    </DashboardShell>
  );
}

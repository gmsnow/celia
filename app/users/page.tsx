import { requireUser } from "@/lib/session";
import { getUsers } from "@/lib/users/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsersView } from "@/components/users/users-view";

export const metadata = {
  title: "إدارة المستخدمين",
  description: "إدارة المستخدمين وإضافة وتعديل بياناتهم وصلاحياتهم",
};

export default async function UsersPage() {
  const session = await requireUser();
  const user = session.user;

  const summary = await getUsers();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.manageUsers">
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
          <UsersView initialSummary={summary} />
        </div>
      </div>
    </DashboardShell>
  );
}

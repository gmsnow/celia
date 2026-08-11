import { requirePagePermission } from "@/lib/session";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function HomePage() {
  const { session, permissions } = await requirePagePermission("dashboard");
  const user = session.user;

  const stats = await getDashboardStats();

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role, permissions }}
      initialStats={stats}
    />
  );
}

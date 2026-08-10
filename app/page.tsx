import { requireUser } from "@/lib/session";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function HomePage() {
  const session = await requireUser();
  const user = session.user;

  const stats = await getDashboardStats();

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role }}
      initialStats={stats}
    />
  );
}

import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TransferDashboard } from "@/components/transfers/transfer-dashboard";

export const metadata = {
  title: "Transfer Dashboard",
  description: "Customer transfer tracking dashboard",
};

export default async function TransfersPage() {
  const session = await requireUser();
  const user = session.user;

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="transfers.pageTitle">
      <TransferDashboard />
    </DashboardShell>
  );
}

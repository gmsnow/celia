import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TransferHistory } from "@/components/transfers/transfer-history";

export const metadata = {
  title: "Transfer History",
  description: "Transfer history with filters",
};

export default async function TransferHistoryPage() {
  const session = await requireUser();
  const user = session.user;

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="transfers.historyTitle">
      <TransferHistory />
    </DashboardShell>
  );
}

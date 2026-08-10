import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DevicesView } from "@/components/transfers/devices-view";

export const metadata = {
  title: "Customer Devices",
  description: "Connected customer devices",
};

export default async function DevicesPage() {
  const session = await requireUser();
  const user = session.user;

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="transfers.devicesTitle">
      <DevicesView />
    </DashboardShell>
  );
}

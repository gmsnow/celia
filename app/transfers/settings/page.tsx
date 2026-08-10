import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsView } from "@/components/transfers/settings-view";

export const metadata = {
  title: "Transfer Settings",
  description: "NAS shares and agent settings",
};

export default async function SettingsPage() {
  const session = await requireUser();
  const user = session.user;

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="transfers.settingsTitle">
      <SettingsView />
    </DashboardShell>
  );
}

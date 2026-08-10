import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getRolePermissions } from "@/lib/roles/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PermissionsView } from "@/components/authorization/permissions-view";

export const metadata = {
  title: "إدارة الصلاحيات",
  description: "تحديد صلاحيات الأدوار",
};

export default async function AuthorizationPage() {
  const session = await requireUser();
  const user = session.user;

  if (user.role !== "admin") {
    redirect("/");
  }

  const data = await getRolePermissions();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.managePermissions">
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
          <PermissionsView initialData={data} />
        </div>
      </div>
    </DashboardShell>
  );
}

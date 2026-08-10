import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CopyPriceSettings } from "@/components/pricing/copy-price-settings";

export const metadata = {
  title: "سعر النسخ",
  description: "تحديد سعر النسخ بالجيجابايت",
};

export default async function CopyPricePage() {
  const session = await requireUser();
  const user = session.user;

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.copyPrice">
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
          <CopyPriceSettings />
        </div>
      </div>
    </DashboardShell>
  );
}

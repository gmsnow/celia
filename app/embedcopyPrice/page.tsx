import { requirePagePermission } from "@/lib/session";
import { getCopyPricePerGB } from "@/lib/pricing/copy-price-store";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CopyPriceSettings } from "@/components/pricing/copy-price-settings";

export const metadata = {
  title: "سعر النسخ",
  description: "تحديد سعر النسخ بالجيجابايت",
};

export const dynamic = "force-dynamic";

export default async function CopyPricePage() {
  const { session, permissions } = await requirePagePermission("set_copy_price");
  const user = session.user;

  const pricePerGB = await getCopyPricePerGB();

  return (
    <DashboardShell user={{ name: user.name, role: user.role, permissions }} titleKey="sidebar.copyPrice">
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
          <CopyPriceSettings isAdmin={user.role === "admin"} initialPrice={pricePerGB} />
        </div>
      </div>
    </DashboardShell>
  );
}

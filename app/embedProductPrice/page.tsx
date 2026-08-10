import { requireUser } from "@/lib/session";
import { getProducts } from "@/lib/products/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductPricesView } from "@/components/products/product-prices-view";

export const metadata = {
  title: "أسعار المنتجات",
  description: "إدارة أسعار المنتجات",
};

export const dynamic = "force-dynamic";

export default async function EmbedProductPricePage() {
  const session = await requireUser();
  const user = session.user;

  const rows = await getProducts();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }} titleKey="sidebar.productPrices">
      <div className="relative flex w-full flex-col overflow-hidden min-h-[calc(100dvh-14rem)]">
        <div
          className="pointer-events-none absolute -top-10 -end-16 size-60 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-16 size-60 rounded-full bg-success/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex-1">
          <ProductPricesView initialRows={rows} />
        </div>
      </div>
    </DashboardShell>
  );
}

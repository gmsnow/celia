"use client";

import { useCallback, useRef, useState } from "react";
import { EyeOff, Package, Plus } from "lucide-react";
import type { ProductSaleRow } from "@/lib/products/queries";
import type { ProductOption } from "@/lib/sales/products";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale-provider";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AddProductForm } from "@/components/sales/add-product-form";

interface ProductsViewProps {
  initialRows: ProductSaleRow[];
  products: ProductOption[];
}

export function ProductsView({ initialRows, products }: ProductsViewProps) {
  const { locale, t } = useLocale();
  const p = t.products;
  const [rows, setRows] = useState<ProductSaleRow[]>(initialRows);
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sales");
      if (res.ok) {
        const data = (await res.json()) as { rows: ProductSaleRow[] };
        setRows(data.rows);
      }
    } catch {
      // keep current rows on failure
    }
  }, []);

  function handleToggle() {
    const next = !formOpen;
    setFormOpen(next);
    if (next) {
      requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant={formOpen ? "outline" : "primary"}
          size="md"
          onClick={handleToggle}
        >
          {formOpen ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {formOpen ? p.hideForm : p.addSale}
        </Button>
      </div>

      {formOpen ? (
        <div ref={formRef} className="scroll-mt-6">
          <AddProductForm products={products} onSuccess={refresh} />
        </div>
      ) : (
        <DataTable
          rows={rows}
          title={p.tableTitle}
          keyOf={(row) => row.id}
          searchText={(row) => `${row.name} ${row.category}`}
          labels={t.dataTable}
          empty={
            <span className="flex flex-col items-center gap-3 py-4">
              <Package className="size-10 text-muted-foreground/50" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">{p.noData}</span>
            </span>
          }
          columns={[
            {
              header: p.name,
              cell: (row) => (
                <span className="text-sm font-bold text-foreground">{row.name}</span>
              ),
            },
            {
              header: p.model,
              cell: (row) => <span className="text-sm text-foreground">{row.category}</span>,
            },
            {
              header: p.finalPrice,
              cell: (row) => (
                <span className="text-sm tabular-nums text-foreground">{formatCurrency(row.finalPrice)}</span>
              ),
            },
            {
              header: p.date,
              cell: (row) => (
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(row.createdAt, locale)}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

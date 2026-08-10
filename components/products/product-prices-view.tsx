"use client";

import { useCallback, useRef, useState } from "react";
import { EyeOff, Plus, RefreshCw } from "lucide-react";
import type { ProductRow } from "@/lib/products/queries";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale-provider";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ProductPriceForm } from "@/components/products/product-price-form";

interface ProductPricesViewProps {
  initialRows: ProductRow[];
}

export function ProductPricesView({ initialRows }: ProductPricesViewProps) {
  const { locale, t } = useLocale();
  const p = t.addProductPrice;
  const dt = t.dataTable;
  const [rows, setRows] = useState<ProductRow[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    const next = !formOpen;
    setFormOpen(next);
    if (next) {
      requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { rows: ProductRow[] };
        setRows(data.rows);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant={formOpen ? "outline" : "primary"} size="md" onClick={handleToggle}>
          {formOpen ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {formOpen ? p.hideForm : p.addLabel}
        </Button>
      </div>

      {formOpen ? (
        <div ref={formRef} className="scroll-mt-6">
          <ProductPriceForm onSuccess={refresh} />
        </div>
      ) : (
        <>
          <DataTable
            rows={rows}
            title={
              <span className="flex items-center gap-2">
                {p.tableTitle}
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {formatNumber(rows.length)}
                </span>
              </span>
            }
            keyOf={(row) => row.id}
            searchText={(row) => [row.name, row.category, String(row.price)].join(" ")}
            labels={{
              lengthMenu: dt.lengthMenu,
              rows: dt.rows,
              search: dt.search,
              searchPlaceholder: dt.searchPlaceholder,
              info: dt.info,
              prev: dt.prev,
              next: dt.next,
              noData: p.noData,
            }}
            minWidth="min-w-160"
            empty={p.noData}
            columns={[
              {
                header: p.nameLabel,
                cell: (row) => (
                  <span className="text-sm font-bold text-foreground">{row.name}</span>
                ),
              },
              {
                header: p.categoryLabel,
                cell: (row) => <span className="text-sm text-foreground">{row.category}</span>,
              },
              {
                header: p.priceLabel,
                cell: (row) => (
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(row.price)}
                  </span>
                ),
              },
              {
                header: p.date,
                cell: (row) => (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatDateTime(row.createdAt, locale)}
                  </span>
                ),
              },
            ]}
          />

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {p.tableTitle}:{" "}
              <span className="font-extrabold tabular-nums text-foreground">
                {formatNumber(rows.length)}
              </span>
            </p>
            <Button variant="outline" size="sm" onClick={refresh} loading={loading}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {p.refresh}
            </Button>
          </footer>
        </>
      )}
    </div>
  );
}

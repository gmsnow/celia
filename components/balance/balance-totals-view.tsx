"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { BalanceChargesSummary } from "@/lib/balance/queries";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale-provider";
import { BalanceChargeForm } from "@/components/balance/balance-charge-form";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

interface BalanceTotalsViewProps {
  initialSummary: BalanceChargesSummary;
}

export function BalanceTotalsView({ initialSummary }: BalanceTotalsViewProps) {
  const { t, locale } = useLocale();
  const bt = t.balanceTotals;
  const dt = t.dataTable;
  const [summary, setSummary] = useState<BalanceChargesSummary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = formOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [formOpen]);

  useEffect(() => {
    if (!formOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFormOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formOpen]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/balance/charge");
      if (res.ok) {
        const data = (await res.json()) as BalanceChargesSummary;
        setSummary(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  function closeForm() {
    setFormOpen(false);
  }

  function handleFormSuccess() {
    void refresh();
    closeForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="primary" size="md" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          {bt.addBalanceSale}
        </Button>
      </div>

      <DataTable
        rows={summary.rows}
        title={
          <span className="flex items-center gap-2">
            {bt.chargesTable}
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {formatNumber(summary.count)}
            </span>
          </span>
        }
        keyOf={(row) => row.id}
        searchText={(row) =>
          [row.provider, row.notes ?? "", String(row.amount), row.createdByName ?? ""].join(" ")
        }
        labels={{
          lengthMenu: dt.lengthMenu,
          rows: dt.rows,
          search: dt.search,
          searchPlaceholder: dt.searchPlaceholder,
          info: dt.info,
          prev: dt.prev,
          next: dt.next,
          noData: bt.noData,
        }}
        minWidth="min-w-160"
        empty={bt.noData}
        columns={[
          {
            header: bt.provider,
            cell: (row) => (
              <span className="text-sm font-bold text-foreground">{row.provider}</span>
            ),
          },
          {
            header: bt.amount,
            cell: (row) => (
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(row.amount)}
              </span>
            ),
          },
          {
            header: bt.notes,
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.notes?.trim() ? row.notes : "—"}
              </span>
            ),
          },
          {
            header: bt.employee,
            cell: (row) => (
              <span className="text-xs text-muted-foreground">{row.createdByName ?? "—"}</span>
            ),
          },
          {
            header: bt.date,
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
          {bt.totalAmount}:{" "}
          <span className="font-extrabold tabular-nums text-primary">
            {formatCurrency(summary.totalAmount)}
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={refresh} loading={loading}>
          <RefreshCw className="size-4" aria-hidden="true" />
          {bt.refresh}
        </Button>
      </footer>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeForm}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <BalanceChargeForm onSuccess={handleFormSuccess} onClose={closeForm} />
          </div>
        </div>
      )}
    </div>
  );
}

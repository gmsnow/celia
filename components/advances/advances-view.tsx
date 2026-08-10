"use client";

import { useCallback, useRef, useState } from "react";
import { EyeOff, Plus, RefreshCw } from "lucide-react";
import type { AdvancesSummary } from "@/lib/advances/queries";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale-provider";
import { AdvanceForm } from "@/components/advances/advance-form";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

interface AdvancesViewProps {
  initialSummary: AdvancesSummary;
  employees: { id: string; name: string }[];
}

export function AdvancesView({ initialSummary, employees }: AdvancesViewProps) {
  const { t, locale } = useLocale();
  const et = t.advancesTotals;
  const dt = t.dataTable;
  const [summary, setSummary] = useState<AdvancesSummary>(initialSummary);
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
      const res = await fetch("/api/advances", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as AdvancesSummary;
        setSummary(data);
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
          {formOpen ? et.hideForm : et.addAdvance}
        </Button>
      </div>

      {formOpen ? (
        <div ref={formRef} className="scroll-mt-6">
          <AdvanceForm employees={employees} onSuccess={refresh} />
        </div>
      ) : (
        <>
          <DataTable
            rows={summary.rows}
            title={
              <span className="flex items-center gap-2">
                {et.tableTitle}
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {formatNumber(summary.count)}
                </span>
              </span>
            }
            keyOf={(row) => row.id}
            searchText={(row) =>
              [row.employeeName, String(row.amount), row.notes ?? "", row.createdByName ?? ""].join(" ")
            }
            labels={{
              lengthMenu: dt.lengthMenu,
              rows: dt.rows,
              search: dt.search,
              searchPlaceholder: dt.searchPlaceholder,
              info: dt.info,
              prev: dt.prev,
              next: dt.next,
              noData: et.noData,
            }}
            minWidth="min-w-160"
            empty={et.noData}
            columns={[
              {
                header: et.employee,
                cell: (row) => (
                  <span className="text-sm font-bold text-foreground">{row.employeeName}</span>
                ),
              },
              {
                header: et.amount,
                cell: (row) => (
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                header: et.notes,
                cell: (row) => (
                  <span className="text-xs text-muted-foreground">
                    {row.notes?.trim() ? row.notes : "—"}
                  </span>
                ),
              },
              {
                header: et.createdBy,
                cell: (row) => (
                  <span className="text-xs text-muted-foreground">{row.createdByName ?? "—"}</span>
                ),
              },
              {
                header: et.date,
                cell: (row) => (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatDateTime(row.advanceDate, locale)}
                  </span>
                ),
              },
            ]}
          />

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {et.totalAmount}:{" "}
              <span className="font-extrabold tabular-nums text-destructive">
                {formatCurrency(summary.totalAmount)}
              </span>
            </p>
            <Button variant="outline" size="sm" onClick={refresh} loading={loading}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {et.refresh}
            </Button>
          </footer>
        </>
      )}
    </div>
  );
}

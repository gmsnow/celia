"use client";

import type { HobaniTotalRow } from "@/lib/hobani/totals";
import { hobaniPeriodLabel } from "@/lib/hobani/income";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale-provider";
import { DataTable } from "@/components/ui/data-table";

interface HobaniTotalsTableProps {
  initialRows: HobaniTotalRow[];
}

export function HobaniTotalsTable({ initialRows }: HobaniTotalsTableProps) {
  const { t, locale } = useLocale();
  const ht = t.hobaniTotals;

  return (
    <DataTable
      rows={initialRows}
      title={ht.pageTitle}
      keyOf={(row) => `${row.day.toISOString()}-${row.period}`}
      searchText={(row) =>
        [
          hobaniPeriodLabel(row.period, t),
          row.day.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB"),
          String(row.totalCards),
        ].join(" ")
      }
      labels={{
        lengthMenu: ht.lengthMenu,
        rows: ht.rows,
        search: ht.search,
        searchPlaceholder: ht.searchPlaceholder,
        info: ht.info,
        prev: ht.prev,
        next: ht.next,
        noData: ht.noData,
      }}
      columns={[
        {
          header: ht.colPeriod,
          cell: (row) => (
            <span className="text-sm font-bold text-foreground">
              {hobaniPeriodLabel(row.period, t)}
            </span>
          ),
        },
        {
          header: ht.colCards,
          cell: (row) => (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatNumber(row.totalCards)}
            </span>
          ),
        },
        {
          header: ht.colAmount,
          cell: (row) => (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(row.totalAmount)}
            </span>
          ),
        },
        {
          header: ht.colCardValue,
          cell: (row) => (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {formatCurrency(row.totalCardValue)}
            </span>
          ),
        },
        {
          header: ht.colDate,
          cell: (row) => (
            <span className="text-xs tabular-nums text-muted-foreground">
              {row.day.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
            </span>
          ),
        },
      ]}
    />
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyRevenuePoint } from "@/lib/dashboard/stats";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/locale-provider";
import { AR_MONTHS } from "@/lib/i18n/dictionaries";

interface RevenueChartProps {
  months: MonthlyRevenuePoint[];
  className?: string;
}

type Period = "all" | "1m" | "6m";

const PERIODS: { key: Period; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "1m", label: "1M" },
  { key: "6m", label: "6M" },
];

type SummaryKey = "profit" | "expenses" | "net" | "advance";

function summaryValue(point: MonthlyRevenuePoint, key: SummaryKey): number {
  switch (key) {
    case "net":
      return point.profit - point.expenses;
    default:
      return point[key];
  }
}

export function RevenueChart({ months, className }: RevenueChartProps) {
  const { t } = useLocale();
  const [period, setPeriod] = useState<Period>("6m");

  const summaryItems = useMemo(
    () => [
      { key: "profit" as const, label: t.dashboard.revenueChart.profit },
      { key: "expenses" as const, label: t.dashboard.revenueChart.expenses },
      { key: "net" as const, label: t.dashboard.revenueChart.netProfit },
      { key: "advance" as const, label: t.dashboard.revenueChart.advance },
    ],
    [t],
  );

  const data = useMemo(() => {
    switch (period) {
      case "1m":
        return months.slice(-1);
      case "6m":
        return months.slice(-6);
      default:
        return months;
    }
  }, [months, period]);

  const current = months[months.length - 1];

  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h3 className="text-base font-extrabold text-foreground">
          {t.dashboard.revenueChart.title}
        </h3>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-bold transition-colors",
                period === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-primary hover:bg-primary/10",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 pt-4 sm:grid-cols-4">
        {summaryItems.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-muted/60 p-3">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <h6 className="mt-0.5 truncate text-sm font-extrabold tabular-nums text-foreground">
              {formatCurrency(summaryValue(current, key))}
            </h6>
          </div>
        ))}
      </div>

      <div className="h-[250px] w-full py-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(value: string) => {
                const index = AR_MONTHS.indexOf(value);
                return index >= 0 ? t.dashboard.date.months[index] : value;
              }}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(value: number) => formatNumber(value)}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              cursor={{ fill: "rgba(13, 148, 136, 0.08)" }}
              formatter={(value) => [formatCurrency(Number(value)), t.dashboard.revenueChart.tooltip]}
              labelFormatter={(label) => {
                const index = AR_MONTHS.indexOf(String(label));
                return index >= 0 ? t.dashboard.date.months[index] : String(label);
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              contentStyle={{ borderRadius: 12, borderColor: "var(--border)", fontSize: 13 }}
            />
            <Bar dataKey="net" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={46} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


"use client";

import { useCallback, useRef, useState } from "react";
import { EyeOff, Plus } from "lucide-react";
import type { HobaniTotalRow } from "@/lib/hobani/totals";
import { useLocale } from "@/lib/i18n/locale-provider";
import { HobaniTotalsTable } from "@/components/hobani/hobani-totals-table";
import { HobaniIncomeForm } from "@/components/hobani/hobani-income-form";
import { Button } from "@/components/ui/button";

interface HobaniTotalsViewProps {
  initialRows: HobaniTotalRow[];
}

export function HobaniTotalsView({ initialRows }: HobaniTotalsViewProps) {
  const { t } = useLocale();
  const ht = t.hobaniTotals;
  const [rows, setRows] = useState<HobaniTotalRow[]>(initialRows);
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/hobani/totals");
      if (res.ok) {
        const data = (await res.json()) as { rows: HobaniTotalRow[] };
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
          {formOpen ? ht.hideForm : ht.addIncome}
        </Button>
      </div>

      {formOpen ? (
        <div ref={formRef} className="scroll-mt-6">
          <HobaniIncomeForm onSuccess={refresh} />
        </div>
      ) : (
        <HobaniTotalsTable initialRows={rows} />
      )}
    </div>
  );
}

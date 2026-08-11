"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
          {ht.addIncome}
        </Button>
      </div>

      <HobaniTotalsTable initialRows={rows} />

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
            <HobaniIncomeForm onSuccess={handleFormSuccess} onClose={closeForm} />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { downloadLoansCsv } from "@/services/loan.service";
import type { LoanFilters } from "@/types/loan";

type ExportCsvButtonProps = {
  filters: LoanFilters;
  onError: (message: string) => void;
};

export function ExportCsvButton({ filters, onError }: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      // Sem resultados o arquivo sai so com o cabecalho: nao e caso de erro.
      await downloadLoansCsv(filters);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Erro ao exportar o relatório",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="rounded bg-teal-700 px-3 py-2 text-sm text-white disabled:opacity-50"
    >
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </button>
  );
}

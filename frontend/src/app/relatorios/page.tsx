"use client";

import { useEffect, useState } from "react";
import { ExportCsvButton } from "@/components/loans/ExportCsvButton";
import { LoanFilters } from "@/components/loans/LoanFilters";
import { LoanReportTable } from "@/components/loans/LoanReportTable";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { listLoans } from "@/services/loan.service";
import { listUsers } from "@/services/user.service";
import type { Loan, LoanFilters as Filters } from "@/types/loan";
import type { User } from "@/types/user";

export default function RelatoriosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      try {
        const data = await listLoans(filters);
        if (cancelled) return;
        setLoans(data);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erro ao carregar o relatório",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-medium">Relatório de empréstimos</h1>
        <ExportCsvButton filters={filters} onError={setError} />
      </div>

      <LoanFilters users={users} filters={filters} onChange={setFilters} />

      {error && <FeedbackMessage variant="error" message={error} />}

      {isLoading && <p>Carregando...</p>}

      {!isLoading && !error && loans.length === 0 && (
        <p>Nenhum empréstimo encontrado para os filtros aplicados.</p>
      )}

      {!isLoading && !error && loans.length > 0 && <LoanReportTable loans={loans} />}
    </main>
  );
}

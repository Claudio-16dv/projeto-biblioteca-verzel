"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Loan } from "@/types/loan";
import { returnLoan } from "@/services/loan.service";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { Button } from "@/components/ui/button";

type LoanTableProps = {
  loans: Loan[];
};

export function LoanTable({ loans }: LoanTableProps) {
  const router = useRouter();
  const [returningLoanId, setReturningLoanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeLoans = loans.filter((loan) => loan.status === "ativo");

  async function handleReturn(loanId: number) {
    setError(null);
    setReturningLoanId(loanId);

    try {
      await returnLoan(loanId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao devolver o livro");
    } finally {
      setReturningLoanId(null);
    }
  }

  if (activeLoans.length === 0) {
    return <p>Nenhum empréstimo ativo</p>;
  }

  return (
    <div className="space-y-3">
      {error && <FeedbackMessage variant="error" message={error} />}

      <table className="w-full text-left text-sm">
        <caption className="sr-only">Empréstimos ativos</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="p-3 font-medium">
              Livro
            </th>
            <th scope="col" className="p-3 font-medium">
              Leitor
            </th>
            <th scope="col" className="p-3 font-medium">
              Data
            </th>
            <th scope="col" className="p-3 font-medium">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {activeLoans.map((loan) => (
            <tr key={loan.id} className="border-b">
              <td className="p-3">{loan.book.title}</td>
              <td className="p-3">{loan.user.name}</td>
              <td className="p-3">
                {new Date(loan.loanedAt).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-3">
                <Button
                  onClick={() => handleReturn(loan.id)}
                  disabled={returningLoanId === loan.id}
                  variant="outline"
                  size="sm"
                >
                  {returningLoanId === loan.id ? "Devolvendo..." : "Devolver"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

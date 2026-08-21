"use client";

import type { Loan } from "@/types/loan";

/**
 * O backend grava e filtra em UTC, e o CSV exporta a data em UTC. Exibir no
 * fuso do navegador faria a tabela divergir do arquivo exportado em um dia.
 */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function LoanReportTable({ loans }: { loans: Loan[] }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Empréstimos do relatório</caption>
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
            Situação
          </th>
        </tr>
      </thead>
      <tbody>
        {loans.map((loan) => (
          <tr key={loan.id} className="border-b">
            <td className="p-3">{loan.book.title}</td>
            <td className="p-3">{loan.user.name}</td>
            <td className="p-3">{formatDate(loan.loanedAt)}</td>
            <td className="p-3 capitalize">{loan.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

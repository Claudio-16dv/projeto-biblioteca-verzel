import { api, apiUrl, readErrorMessage } from "@/lib/api";
import type { Loan, LoanFilters } from "@/types/loan";

/**
 * Monta a query string omitindo filtros vazios: o backend valida o formato de
 * `from`/`to` e recusaria uma string vazia.
 */
function toQueryString(filters: LoanFilters): string {
  const params = new URLSearchParams();

  if (filters.userId !== undefined) params.set("userId", String(filters.userId));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listLoans(): Promise<Loan[]> {
  return api<Loan[]>("/loans");
}

export async function createLoan(
  bookId: number,
  userId: number,
): Promise<Loan> {
  return api<Loan>("/loans", {
    method: "POST",
    body: JSON.stringify({ bookId, userId }),
  });
}

export async function returnLoan(loanId: number): Promise<Loan> {
  return api<Loan>(`/loans/${loanId}/return`, {
    method: "PATCH",
  });
}

/** BIBL-4: relatório com os filtros combinados. Sem filtro, devolve tudo. */
export async function listLoans(filters: LoanFilters = {}): Promise<Loan[]> {
  return api<Loan[]>(`/loans${toQueryString(filters)}`);
}

/** Nome do arquivo anunciado pelo backend, com fallback. */
function filenameFrom(contentDisposition: string | null): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? "emprestimos.csv";
}

/**
 * BIBL-5: baixa o CSV do mesmo conjunto filtrado do relatório.
 *
 * Sem resultados o backend devolve 200 com apenas o cabeçalho, entao o download
 * acontece normalmente e a tela nao precisa tratar esse caso como erro.
 */
export async function downloadLoansCsv(
  filters: LoanFilters = {},
): Promise<void> {
  const response = await fetch(apiUrl(`/loans/export${toQueryString(filters)}`));

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filenameFrom(response.headers.get("Content-Disposition"));
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

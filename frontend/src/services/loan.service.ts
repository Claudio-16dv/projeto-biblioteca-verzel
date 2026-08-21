import { api } from "@/lib/api";
import type { Loan } from "@/types/loan";

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

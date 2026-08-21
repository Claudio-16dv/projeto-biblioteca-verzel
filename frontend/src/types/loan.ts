import type { Book } from "./book";
import type { User } from "./user";

export type LoanStatus = "ativo" | "devolvido";

export type Loan = {
  id: number;
  book: Book;
  user: User;
  loanedAt: string;
  returnedAt: string | null;
  status: LoanStatus;
};

/** Filtros do relatório (BIBL-4) e da exportação CSV (BIBL-5). */
export type LoanFilters = {
  userId?: number;
  from?: string;
  to?: string;
  status?: LoanStatus;
};

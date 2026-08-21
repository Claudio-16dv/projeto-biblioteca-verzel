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

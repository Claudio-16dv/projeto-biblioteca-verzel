import { Book, Loan, User } from '@prisma/client';

type LoanWithRelations = Loan & { book: Book; user: User };

export function toLoanResponse(loan: LoanWithRelations) {
  return {
    id: loan.id,
    book: loan.book,
    user: loan.user,
    loanedAt: loan.loanedAt,
    returnedAt: loan.returnedAt,
    status: loan.returnedAt ? 'devolvido' : 'ativo',
  };
}
